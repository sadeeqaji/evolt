import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { FastifyInstance } from 'fastify';

import poolService from '../pool/pool.service.js';
import investorService from '../investor/investor.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { WalletService as WalletCreator } from '../wallet/wallet.service.js';
import assetService from "../asset/asset.service.js";
import investmentService from '../investment/investment.service.js';
import PaystackService from 'payment/paystack.service.js';
import swapService from '@swap/swap.service.js';
import { AssetDoc } from 'asset/asset.type.js';

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

      // const hasPin = await PinService.ensurePin(phoneNumber);
      // if (!hasPin) {
      //   return "🔐 Please set your transaction PIN — a WhatsApp Flow has been sent.";
      // }
      // await PinService.requestAuthorization(phoneNumber, 'Investment')

      try {
        const result = await poolService.listPools({
          status: status as any,
          search,
          page: 1,
          limit: 5,
        });
        const items = result.items.map((item: any, i: number) => ({
          index: i + 1,
          id: item._id,
          title: item.title,
          yieldRate: item.yieldRate,
          fundingProgress: item.fundingProgress,
          daysLeft: item.daysLeft,
        }));
        await app.redis.set(assetListKey(phoneNumber), JSON.stringify(items), "EX", 3600);
        return items.length ? items.join("\n") : "No assets found.";
      } catch (e: any) {
        return `Error: ${e.message}`;
      }
    },
    {
      name: "get_rwa_assets",
      description:
        "Get a list of available real-world assets (RWAs) or investment pools. Use this to show a user what they can invest in.",
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

export const createAssociateTokenTool = (_app: FastifyInstance) => {
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
        let resolvedId = assetId;
        if (cached) {
          const assets = JSON.parse(cached);

          // if user sent a number (e.g. "2")
          if (/^\d+$/.test(assetId.trim())) {
            const index = parseInt(assetId, 10);
            resolvedId = assets.find((a: any) => a.index === index)?.id || assetId;
          } else {
            // 🔍 normalize user input and titles for better matching
            const userInput = assetId.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

            const match = assets.find((a: any) => {
              const cleanTitle = a.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
              return cleanTitle.includes(userInput) || userInput.includes(cleanTitle);
            });

            if (match) resolvedId = match.id;
          }
        }
        // if (!resolvedId || resolvedId.length < 10) {
        //   return "⚠️ I couldn’t identify that asset. Please say 'Show available investments' again to refresh the list.";
        // }
        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor?.accountId)
          return "You don’t have a wallet yet. Would you like me to create one for you first?";

        const { accountId, _id } = investor;
        const investorId = String(_id);
        const { txId, receipt } = await swapService.transferVusdFromUserToTreasury({
          phoneNumber,
          fromAccountId: accountId,
          amountUsd: amount,
        });
        if (receipt.status.toString() !== "SUCCESS")
          return "❌ vUSD transfer failed. Please try again later.";

        const result = await investmentService.investFromDepositDirect(
          { accountId, investorId },
          { assetId: resolvedId, txId, amount }
        );

        const inv = await result.investment.populate<{ assetRef: AssetDoc }>("assetRef", "title assetType tokenId");

        return [
          "✅ Investment successful!",
          `• Asset: ${inv?.assetRef?.title ?? "Selected pool"}`,
          `• Amount: $${amount.toFixed(2)} VUSD`,
          `• Expected Earnings: $${Number(inv.yieldRate).toFixed(2)} VUSD`,
          `• Maturity: ${inv.maturedAt ? new Date(inv.maturedAt).toDateString() : 'Not set'}`,
        ].join("\n");
      } catch (err: any) {
        console.log(err, 'err')
        return `❌ Error: ${err}`;
      }
    },
    {
      name: "join_pool",
      description:
        "Invests in a pool. Resolves the actual MongoDB asset ID by index or name from cached results in Redis.",
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