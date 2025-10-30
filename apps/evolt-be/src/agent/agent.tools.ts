import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { FastifyInstance } from 'fastify';

import poolService from '../pool/pool.service.js';
import investorService from '../investor/investor.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { WalletService as WalletCreator } from '../wallet/wallet.service.js';
import assetService from "../asset/asset.service.js";
import investmentService from '../investment/investment.service.js';
import PaystackService from '../payment/paystack.service.js';
import swapService from '../swap/swap.service.js';
import mongoose from "mongoose";

const isObjectId = (s: string) => mongoose.Types.ObjectId.isValid(s);

const assetListKey = (phone: string) => `assets:${phone}`;


export const createGetRwaAssetsTool = (app: FastifyInstance) => {
  const getRwaAssetsSchema = z.object({
    status: z
      .string()
      .optional()
      .describe("Filter by status: 'funding', 'funded', 'fully_funded'"),
    search: z.string().optional().describe("A search term to filter pools by name"),
    phoneNumber: z.string().describe("User phone in E.164 or WhatsApp raw"),
  });

  return tool(
    async ({ status, search, phoneNumber }: z.infer<typeof getRwaAssetsSchema>) => {
      try {
        const result = await poolService.listPools({
          status: status as any,
          search,
          page: 1,
          limit: 5,
        });
        const items = result.items.map((item: any, i: number) => ({
          index: i + 1,
          assetId: item._id,
          tokenId: item.tokenId,
          title: item.title,
          yieldRate: item.yieldRate ?? 0,
          fundingProgress: item.fundingProgress ?? 0,
          daysLeft: item.daysLeft ?? 0,
        }));

        const formatted = items
          .map(
            (a) =>
              `${a.index}. ${a.title}\n   • Yield: ${(a.yieldRate * 100).toFixed(1)}%\n   • Progress: ${a.fundingProgress.toFixed(0)}%\n   • ${a.daysLeft} days left\n`
          )
          .join("\n");

        await app.redis.set(assetListKey(phoneNumber), JSON.stringify(items), "EX", 3600);

        return formatted || "No investment pools found at the moment. Please check again later.";
      } catch (e: any) {
        console.error("Error fetching RWA assets:", e);
        return `❌ Error fetching investment pools: ${e?.message || String(e)}`;
      }
    },
    {
      name: "get_rwa_assets",
      description:
        "Lists available real-world assets or investment pools with yield rate, funding progress, and duration. Caches the result in Redis for lookup during pool joining.",
      schema: getRwaAssetsSchema as any,
    }
  );
};

export const createGetPortfolioTool = () => {
  const portfolioSchema = z.object({
    accountId: z
      .string()
      .describe("The user's Hedera account ID (e.g., 0.0.12345)"),
  });

  return tool(
    async (input: z.infer<typeof portfolioSchema>) => {
      const { accountId } = input;
      if (!accountId || accountId === 'Not yet connected') {
        return "User's wallet is not connected. Please ask them to connect their wallet first.";
      }

      try {
        const portfolio = await investorService.getInvestorPortfolio(accountId);
        return `Portfolio fetched: ${JSON.stringify(portfolio)}`;
      } catch (e: any) {
        return `Error: ${e.message}`;
      }
    },
    {
      name: 'get_portfolio',
      description:
        "Get the user's current investment portfolio, including pending and completed investments. Requires the user's accountId.",
      schema: portfolioSchema as any, // 👈 fix
    },
  );
};


export const createConnectWalletTool = (app: FastifyInstance) => {
  const walletService = new WalletService(app);
  const connectWalletSchema = z.object({
    phoneNumber: z
      .string()
      .describe("The user's E.164 phone number (e.g. '+15551234567')"),
  });

  return tool(
    async (input: z.infer<typeof connectWalletSchema>) => {
      const { phoneNumber } = input;
      try {
        const existing = await investorService.getInvestorByPhone(phoneNumber);
        if (existing?.accountId) {
          return `This user's wallet is already connected (Account ID: ${existing.accountId}).`;
        }

        const { connectLink } =
          await walletService.initiateWalletConnect(phoneNumber);
        return `🔗 Tap below to open your wallet and sign the verification message:\n\n${connectLink}\n\nOnce signed, your wallet will be linked automatically.`;
      } catch (e: any) {
        return `Error: ${e.message}`;
      }
    },
    {
      name: 'connect_wallet',
      description:
        "Generates and sends a wallet connection link when a user asks to connect, sign up, or link their wallet. Requires the user's phone number.",
      schema: connectWalletSchema as any,
    },
  );
};


export const createWalletTool = () => {
  const createWalletSchema = z.object({
    phoneNumber: z
      .string()
      .describe(
        'A unique identifier for the user, such as their phone number.',
      ),
  });

  return tool(
    async (input: z.infer<typeof createWalletSchema>) => {
      const { phoneNumber } = input;
      try {
        const result = await WalletCreator.createWallet(phoneNumber);
        return result.message;
      } catch (e: any) {
        return `Error: ${e.message}`;
      }
    },
    {
      name: 'create_wallet',
      description:
        'Creates a new Hedera wallet (alias-based) for a user. Requires a unique user ID (like their phone number).',
      schema: createWalletSchema as any,
    },
  );
};

export const createAssociateTokenTool = () => {
  const schema = z.object({
    phoneNumber: z.string().describe("User phone in E.164 or raw WhatsApp format"),
    tokenId: z.string().describe("HTS token ID (e.g., 0.0.123456)"),
  });

  return tool(
    async ({ phoneNumber, tokenId }) => {
      try {
        const res = await WalletService.associateTokenFor(phoneNumber, tokenId);
        return typeof res?.message === "string"
          ? res.message
          : `Association completed for ${phoneNumber} -> ${tokenId}`;
      } catch (e: any) {
        return `Error associating token: ${e.message}`;
      }
    },
    {
      name: "associate_token",
      description:
        "Associate a user's Hedera account with an HTS token. Use when the user says 'associate' / 'link' to a token. Requires phoneNumber and tokenId.",
      schema: schema as any,
    }
  );
};


export const createPreviewEarningsTool = () => {
  const schema = z.object({
    assetId: z.string().describe("The Asset _id"),
    amount: z.number().positive().describe("User's invest amount in VUSD"),
  });

  return tool(
    async ({ assetId, amount }: z.infer<typeof schema>) => {
      const asset = await assetService.getAssetById(assetId);
      if (!asset) return "Asset not found.";

      const face = Number(asset.amount || 0);
      const yieldRate = Number(asset.yieldRate || 0);
      const durationDays = Number(asset.durationDays || 90);
      const totalTarget = Number(asset.totalTarget || 0);

      const purchase = totalTarget || (yieldRate ? face * (1 - yieldRate) : face);
      const profitPool = Math.max(0, face - purchase);
      const expected = purchase > 0 ? (amount / purchase) * profitPool : 0;

      const expected2dp = Math.round(expected * 100) / 100;

      return [
        `Preview for ${asset.assetType?.toUpperCase() || "asset"}:`,
        `• Face Value: $${face.toLocaleString()}`,
        `• Discount: ${(yieldRate * 100).toFixed(0)}%  → Purchase: $${purchase.toLocaleString()}`,
        `• Profit Pool: $${profitPool.toLocaleString()}`,
        `• Your Investment: $${amount.toFixed(2)} → Expected Earnings ≈ $${expected2dp.toFixed(2)} at maturity (~${durationDays} days).`,
        ``,
        `Note: This uses proportional profit-share. Actual on-chain settlement happens at maturity.`,
      ].join("\n");
    },
    {
      name: "preview_earnings",
      description:
        "Calculate and explain expected earnings for a given asset and amount (2 decimal places).",
      schema: schema as any,
    }
  );
};


export const createJoinPoolTool = (app: FastifyInstance) => {
  const schema = z.object({
    phoneNumber: z.string(),
    assetId: z.string(),
    amount: z.number().positive(),
  });

  return tool(
    async ({ phoneNumber, assetId, amount }: z.infer<typeof schema>) => {
      try {
        const cached = await app.redis.get(assetListKey(phoneNumber));
        let resolvedAssetId: string | undefined;
        let chosenTitle: string | undefined;

        if (cached) {
          const assets: Array<{
            index: number;
            poolId: string;
            assetId: string;
            title: string;
          }> = JSON.parse(cached);
          if (/^\d+$/.test(assetId.trim())) {
            const idx = parseInt(assetId.trim(), 10);
            const hit = assets.find(a => a.index === idx);
            if (hit?.assetId) {
              resolvedAssetId = hit.assetId;
              chosenTitle = hit.title;
            }
          } else {
            const q = assetId.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
            const hit = assets.find(a =>
              a.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").includes(q)
            );
            if (hit?.assetId) {
              resolvedAssetId = hit.assetId;
              chosenTitle = hit.title;
            }
          }
        }

        if (!resolvedAssetId && isObjectId(assetId)) {
          resolvedAssetId = assetId;
        }

        if (!resolvedAssetId || !isObjectId(resolvedAssetId)) {
          return "⚠️ I couldn’t identify that pool. Please reply with the number shown in the list (e.g. `1`).";
        }

        const asset = await assetService.getAssetById(resolvedAssetId);
        if (!asset) {
          return "⚠️ The selected asset was not found or is no longer available. Please ask for the latest list again.";
        }

        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor?.accountId) {
          return "You don’t have a wallet yet. Would you like me to create one for you first?";
        }

        const { accountId, _id } = investor;
        const investorId = String(_id);

        if (asset?.tokenId) {
          try {
            // Associate the ASSET token so escrow can deliver iTokens later
            await WalletService.associateTokenFor(phoneNumber, String(asset.tokenId));
          } catch (e) {
            console.warn("asset association warn:", (e as any)?.message ?? e);
          }
        }


        const { txId, receipt } = await swapService.transferVusdFromUserToTreasury({
          phoneNumber,
          fromAccountId: accountId,
          amountUsd: amount,
        });
        if (receipt.status.toString() !== "SUCCESS") {
          return "❌ vUSD transfer failed. Please try again later.";
        }

        // Record on-chain and in DB
        const result = await investmentService.investFromDepositDirect(
          { accountId, investorId },
          { assetId: resolvedAssetId, txId, amount }
        );

        const inv = await investmentService.getInvestmentById(String(result?.investment._id))


        const title =
          (inv as any)?.assetRef?.title ??
          chosenTitle ??
          asset.title ??
          "Selected pool";

        return [
          "✅ Investment successful!",
          `• Asset: ${title}`,
          `• Amount: $${amount.toFixed(2)} VUSD`,
          `• Expected Earnings: $${Number(result.investment.expectedYield).toFixed(2)} VUSD`,
          `• Maturity: ${result.investment.maturedAt ? new Date(result.investment.maturedAt).toDateString() : 'Not set'}`,
        ].join("\n");
      } catch (err: any) {
        console.error("join_pool error:", err);
        return `❌ Error: ${err?.message || String(err)}`;
      }
    },
    {
      name: "join_pool",
      description:
        "Invests in a pool. Resolves the user's selection to a valid Asset _id from Redis before moving funds.",
      schema: schema as any,
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
    async (params: { phoneNumber: string; amount?: number }) => {
      const { phoneNumber, amount } = params;
      try {

        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor) return "Please create your wallet before funding.";

        const { link, reference } = await paystack.initializeForUser(phoneNumber, amount!);

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