import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { FastifyInstance } from "fastify";

import investorService from "../investor/investor.service.js";
import assetService from "../asset/asset.service.js";
import poolService from "../pool/pool.service.js";
import investmentService from "../investment/investment.service.js";
import { WalletService } from "../wallet/wallet.service.js";
import { WalletService as WalletCreator } from "../wallet/wallet.service.js";
import PinService from "../pin/pin.service.js";
import PaystackService from "../payment/paystack.service.js";
import hederaService from "../hedera/hedera.service.js";
import WhatsAppService from "../whatsapp/whatsapp.service.js";

const VUSD_TOKEN_ID = process.env.HEDERA_VUSD_TOKEN_ID


export const createGetUserStatusTool = () => {
  const schema = z.object({
    phoneNumber: z.string().describe("User phone number in E.164 format."),
  });

  return tool(
    async ({ phoneNumber }: z.infer<typeof schema>) => {
      try {
        await WhatsAppService.sendTypingIndicator(phoneNumber, 2500);

        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor?.accountId) {
          return {
            status: "NO_WALLET",
            balance: 0,
            message: "User has no wallet yet.",
          };
        }

        const vusdBalance = await hederaService.getAccountBalance(
          investor.accountId,
          VUSD_TOKEN_ID
        );

        if (vusdBalance < 1) {
          return {
            status: "WALLET_NO_FUNDS",
            accountId: investor.accountId,
            balance: vusdBalance,
            message: "User has a wallet but no funds.",
          };
        }

        const portfolio = await investorService.getInvestorPortfolio(
          investor.accountId
        );

        if (portfolio.pending.length > 0 || portfolio.completed.length > 0) {
          return {
            status: "INVESTED",
            accountId: investor.accountId,
            balance: vusdBalance,
            message: "User has existing investments.",
          };
        }

        return {
          status: "WALLET_FUNDED",
          accountId: investor.accountId,
          balance: vusdBalance,
          message: "User is ready to invest.",
        };
      } catch (e: any) {
        return {
          status: "ERROR",
          message: `Error checking user status: ${e.message}`,
        };
      }
    },
    {
      name: "get_user_status",
      description:
        "Checks if a user (by phone number) has a wallet, their balance, and investment status. This should be the FIRST tool called in any flow.",
      schema,
    }
  );
};


export const createWalletTool = () => {
  const schema = z.object({
    phoneNumber: z.string().describe("User phone number in E.164 format."),
  });

  return tool(
    async ({ phoneNumber }: z.infer<typeof schema>) => {
      try {
        const existing = await investorService.getInvestorByPhone(phoneNumber);
        if (existing?.accountId) {
          return `This user's wallet is already set up (Account ID: ${existing.accountId}).`;
        }

        await WhatsAppService.sendTypingIndicator(phoneNumber, 1500);
        const result = await WalletCreator.createWallet(phoneNumber);

        return result.message || "✅ Wallet created successfully.";
      } catch (e: any) {
        return `❌ Error creating wallet: ${e.message}`;
      }
    },
    {
      name: "create_wallet",
      description:
        "Creates a secure Evolt-managed wallet for the user. Call this when get_user_status returns 'NO_WALLET'.",
      schema,
    }
  );
};


export const createFundWalletTool = (app: FastifyInstance) => {
  const paystack = new PaystackService(app);

  const schema = z.object({
    phoneNumber: z.string().describe("User phone number in E.164 format."),
    amount: z.number().positive().optional().describe("Amount to fund in USD."),
  });

  return tool(
    async ({ phoneNumber, amount }: z.infer<typeof schema>) => {
      try {
        await WhatsAppService.sendTypingIndicator(phoneNumber, 2000);

        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor) return "Please create your wallet before funding.";

        const payment = await paystack.initializeForUser(phoneNumber, 10);
        console.log(payment, 'payment===');
        const { link, reference } = payment
        return [
          `💸 Here's your secure payment link:`,
          `${link}`,
          "",
          `After payment, your digital dollar wallet will automatically update.`,
          `Reference: ${reference}`,
        ].join("\n");
      } catch (e: any) {
        return `❌ Error generating payment link: ${e.message}`;
      }
    },
    {
      name: "fund_wallet",
      description:
        "Generates a secure Paystack payment link to fund the user's wallet. Called when user has a wallet but insufficient funds.",
      schema,
    }
  );
};


export const getCustomersRwaAssetsTool = () => {
  const schema = z.object({
    status: z
      .string()
      .optional()
      .describe("Filter by 'funding', 'funded', or 'fully_funded'"),
    search: z.string().optional().describe("Search term for pool name."),
  });

  return tool(
    async ({ status, search }: z.infer<typeof schema>) => {
      try {
        const result = await poolService.listPools({
          status: status as any,
          search,
          page: 1,
          limit: 5,
        });

        const rows = result.items.map((item: any, i: number) => {
          const yieldRate = (Number(item.yieldRate ?? 0) * 100).toFixed(0);
          const progress = Number(item.fundingProgress ?? 0).toFixed(0);
          const daysLeft = Number(item.daysLeft ?? 0);
          return `${i + 1}. ${item.title} — Yield: ${yieldRate}% • ${progress}% funded • ${daysLeft} days left`;
        });

        if (!rows.length) return "No available investments at the moment.";

        return (
          "📈 Here are some top investment opportunities:\n\n" +
          rows.join("\n") +
          "\n\nReply with a number (e.g., '1') to see more details or say 'invest 50 in 1'."
        );
      } catch (e: any) {
        return `❌ Error fetching assets: ${e.message}`;
      }
    },
    {
      name: "get_rwa_assets",
      description:
        "Retrieves a list of available RWA investment pools for the user.",
      schema,
    }
  );
};


export const createGetPortfolioTool = () => {
  const schema = z.object({
    phoneNumber: z.string().describe("User phone number in E.164 format."),
  });

  return tool(
    async ({ phoneNumber }: z.infer<typeof schema>) => {
      try {
        await WhatsAppService.sendTypingIndicator(phoneNumber, 2000);

        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor?.accountId)
          return "Please create a wallet first before checking your portfolio.";

        const portfolio = await investorService.getInvestorPortfolio(
          investor.accountId
        );

        let response = "📊 *Your Portfolio Summary*\n";
        response += `\n*Active Investments* (${portfolio.pending.length})\n`;
        response += `Total Invested: $${portfolio.totals.tvlPending.toFixed(
          2
        )}\n`;
        response += `Earnings so far: $${portfolio.totals.earningsToDatePending.toFixed(
          2
        )}\n`;

        if (portfolio.pending.length > 0) {
          portfolio.pending.slice(0, 3).forEach((inv: any) => {
            response += `• ${inv.poolName}: $${inv.vusdAmount.toFixed(
              2
            )} (${inv.earningsPctToDate.toFixed(0)}% matured)\n`;
          });
        } else {
          response += "No active investments yet.\n";
        }

        response += `\n*Completed Investments* (${portfolio.completed.length})\n`;
        if (portfolio.completed.length > 0) {
          portfolio.completed.slice(0, 3).forEach((inv: any) => {
            response += `• ${inv.poolName}: $${inv.vusdAmount.toFixed(
              2
            )} (completed)\n`;
          });
        } else {
          response += "No completed investments.\n";
        }

        return response;
      } catch (e: any) {
        return `❌ Error fetching portfolio: ${e.message}`;
      }
    },
    {
      name: "get_portfolio",
      description:
        "Retrieves user's portfolio (active + completed investments) based on phone number.",
      schema,
    }
  );
};


export const createInvestInAssetTool = () => {
  const schema = z.object({
    phoneNumber: z.string().describe("User phone in E.164 or WhatsApp raw."),
    assetId: z.string().describe("Asset _id from get_rwa_assets."),
    amount: z.number().positive().describe("Investment amount in VUSD."),
  });

  return tool(
    async ({ phoneNumber, assetId, amount }: z.infer<typeof schema>) => {
      const investor = await investorService.getInvestorByPhone(phoneNumber);
      if (!investor?.accountId)
        return "No wallet connected. Please create a wallet first.";

      const hasPin = await PinService.ensurePin(phoneNumber);
      if (!hasPin)
        return "🔐 Please set your 4-digit PIN first. I’ve sent a WhatsApp Flow to help you do that.";

      const vusdBalance = await hederaService.getAccountBalance(
        investor.accountId,
        VUSD_TOKEN_ID
      );

      if (vusdBalance < amount)
        return `You have $${vusdBalance.toFixed(
          2
        )}, but need $${amount}. Would you like to fund your wallet?`;

      await PinService.requestAuthorization(phoneNumber, `Invest $${amount}`);

      const asset = await assetService.getAssetById(assetId);
      if (!asset) return "Asset not found.";

      const yieldRate = Number(asset.yieldRate || 0.1);
      const expectedYield = Number((amount * yieldRate).toFixed(2));
      const maturedAt = new Date(
        Date.now() + (asset.durationDays ?? 90) * 86400000
      );

      return [
        "✅ Investment initiated successfully!",
        `• Asset: ${asset.title}`,
        `• Amount: $${amount}`,
        `• Expected Earnings: ~$${expectedYield}`,
        `• Maturity: ${maturedAt.toDateString()}`,
        "",
        "Your WhatsApp Flow PIN confirmation will finalize this investment.",
      ].join("\n");
    },
    {
      name: "invest_in_asset",
      description:
        "Initiates an investment in a selected RWA asset. Requires wallet, sufficient balance, and PIN confirmation via WhatsApp.",
      schema,
    }
  );
};


export const createAssociateTokenTool = (_app: FastifyInstance) => {
  const schema = z.object({
    phoneNumber: z.string().describe("User phone number in E.164 format."),
    tokenId: z.string().describe("Asset Token ID (e.g., 0.0.123456)"),
  });

  return tool(
    async ({ phoneNumber, tokenId }) => {
      try {
        const res = await WalletService.associateTokenFor(phoneNumber, tokenId);
        return (
          res?.message ||
          `✅ Token association completed for ${phoneNumber} → ${tokenId}`
        );
      } catch (e: any) {
        return `❌ Error associating token: ${e.message}`;
      }
    },
    {
      name: "associate_token",
      description:
        "Associates a user's wallet with an HTS token. Used when investments fail due to association errors.",
      schema,
    }
  );
};

export const createPreviewEarningsTool = () => {
  const schema = z.object({
    assetId: z.string().describe("The Asset _id"),
    amount: z.number().positive().describe("Investment amount in VUSD."),
  });

  return tool(
    async ({ assetId, amount }: z.infer<typeof schema>) => {
      const asset = await assetService.getAssetById(assetId);
      if (!asset) return "Asset not found.";

      const yieldRate = Number(asset.yieldRate || 0.1);
      const durationDays = Number(asset.durationDays || 90);
      const expectedProfit = Number((amount * yieldRate).toFixed(2));

      return [
        `📊 Here's a preview for investing $${amount.toFixed(2)} in *${asset.title}*:`,
        `• Yield: ${(yieldRate * 100).toFixed(0)}%`,
        `• Duration: ~${durationDays} days`,
        `• Expected Profit: ~$${expectedProfit.toFixed(2)}`,
        "",
        `At maturity, you’ll receive ~$${(amount + expectedProfit).toFixed(
          2
        )}.`,
      ].join("\n");
    },
    {
      name: "preview_earnings",
      description:
        "Calculates and explains expected profit for a given asset and investment amount.",
      schema,
    }
  );
};