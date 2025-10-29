import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { FastifyInstance } from 'fastify';

import poolService from '../pool/pool.service.js';
import investorService from '../investor/investor.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { WalletService as WalletCreator } from '../wallet/wallet.service.js';
import assetService from '../asset/asset.service.js';
import investmentService from '../investment/investment.service.js';
import PinService from '../pin/pin.service.js';

export const getCustomersRwaAssetsTool = () => {
  const getRwaAssetsSchema = z.object({
    status: z
      .string()
      .optional()
      .describe("Filter by status: 'funding', 'funded', 'fully_funded'"),
    search: z
      .string()
      .optional()
      .describe('A search term to filter pools by name'),
    phoneNumber: z.string().describe('User phone in E.164 or WhatsApp raw'),
  });

  return tool(
    async ({
      status,
      search,
      phoneNumber,
    }: z.infer<typeof getRwaAssetsSchema>) => {
      const hasPin = await PinService.ensurePin(phoneNumber);
      if (!hasPin) {
        return '🔐 Please set your transaction PIN — a WhatsApp Flow has been sent.';
      }
      await PinService.requestAuthorization(phoneNumber, 'Investment');

      try {
        const result = await poolService.listPools({
          status: status as any,
          search,
          page: 1,
          limit: 5,
        });

        const rows = result.items.map((item: any, i: number) => {
          const y = Number(item.yieldRate ?? 0) * 100;
          const p = Number(item.fundingProgress ?? 0);
          const d = Number(item.daysLeft ?? 0);
          return `${i + 1}. ${item.projectName} — Yield: ${y.toFixed(
            0,
          )}% • Progress: ${p.toFixed(0)}% • ${d} days left`;
        });

        return rows.length ? rows.join('\n') : 'No assets found.';
      } catch (e: any) {
        return `Error: ${e.message}`;
      }
    },
    {
      name: 'get_rwa_assets',
      description:
        'Get a list of available real-world assets (RWAs) or investment pools. Use this to show a user what they can invest in.',
      schema: getRwaAssetsSchema as any,
    },
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
    userId: z
      .string()
      .describe(
        'A unique identifier for the user, such as their phone number.',
      ),
  });

  return tool(
    async (input: z.infer<typeof createWalletSchema>) => {
      const { userId } = input;
      try {
        const result = await WalletCreator.createWallet(userId);
        return result.message;
      } catch (e: any) {
        return `Error: ${e.message}`;
      }
    },
    {
      name: 'create_wallet',
      description:
        'Creates a new Hedera wallet (alias-based) for a user. Requires a unique user ID (like their phone number).',
      schema: createWalletSchema as any, // 👈 fix
    },
  );
};

export const createAssociateTokenTool = (_app: FastifyInstance) => {
  const schema = z.object({
    phoneNumber: z
      .string()
      .describe('User phone in E.164 or raw WhatsApp format'),
    tokenId: z.string().describe('HTS token ID (e.g., 0.0.123456)'),
  });

  return tool(
    async ({ phoneNumber, tokenId }) => {
      try {
        const res = await WalletService.associateTokenFor(phoneNumber, tokenId);
        return typeof res?.message === 'string'
          ? res.message
          : `Association completed for ${phoneNumber} -> ${tokenId}`;
      } catch (e: any) {
        return `Error associating token: ${e.message}`;
      }
    },
    {
      name: 'associate_token',
      description:
        "Associate a user's Hedera account with an HTS token. Use when the user says 'associate' / 'link' to a token. Requires phoneNumber and tokenId.",
      schema: schema as any,
    },
  );
};

export const createPreviewEarningsTool = () => {
  const schema = z.object({
    assetId: z.string().describe('The Asset _id'),
    amount: z.number().positive().describe("User's invest amount in VUSD"),
  });

  return tool(
    async ({ assetId, amount }: z.infer<typeof schema>) => {
      const asset = await assetService.getAssetById(assetId);
      if (!asset) return 'Asset not found.';

      const face = Number(asset.amount || 0);
      const yieldRate = Number(asset.yieldRate || 0);
      const durationDays = Number(asset.durationDays || 90);
      const totalTarget = Number(asset.totalTarget || 0);

      const purchase =
        totalTarget || (yieldRate ? face * (1 - yieldRate) : face);
      const profitPool = Math.max(0, face - purchase);
      const expected = purchase > 0 ? (amount / purchase) * profitPool : 0;

      const expected2dp = Math.round(expected * 100) / 100;

      return [
        `Preview for ${asset.assetType?.toUpperCase() || 'asset'}:`,
        `• Face Value: $${face.toLocaleString()}`,
        `• Discount: ${(yieldRate * 100).toFixed(0)}%  → Purchase: $${purchase.toLocaleString()}`,
        `• Profit Pool: $${profitPool.toLocaleString()}`,
        `• Your Investment: $${amount.toFixed(2)} → Expected Earnings ≈ $${expected2dp.toFixed(2)} at maturity (~${durationDays} days).`,
        ``,
        `Note: This uses proportional profit-share. Actual on-chain settlement happens at maturity.`,
      ].join('\n');
    },
    {
      name: 'preview_earnings',
      description:
        'Calculate and explain expected earnings for a given asset and amount (2 decimal places).',
      schema: schema as any,
    },
  );
};

export const createJoinPoolTool = () => {
  const schema = z.object({
    phoneNumber: z.string().describe('User phone in E.164 or WhatsApp raw'),
    assetId: z.string().describe('Asset _id to invest in'),
    amount: z.number().positive().describe('Amount in VUSD'),
    txId: z
      .string()
      .optional()
      .describe("Hedera transaction id of user's vUSD → escrow transfer"),
  });

  return tool(
    async ({ phoneNumber, assetId, amount, txId }: z.infer<typeof schema>) => {
      // 1) Resolve investor
      const investor = await investorService.getInvestorByPhone(phoneNumber);
      if (!investor?.accountId) {
        return 'Your wallet is not connected yet. Please connect your wallet first.';
      }
      const investorId = String(investor._id);
      const accountId = investor.accountId;
      const hasPin = await PinService.ensurePin(phoneNumber);
      if (!hasPin) {
        return '🔐 Please set your transaction PIN — a WhatsApp Flow has been sent.';
      }

      if (txId) {
        try {
          const res = await investmentService.investFromDeposit(
            { accountId, investorId },
            { assetId, txId },
          );
          const inv = res?.investment;
          const earned = Number(inv?.expectedYield || 0);
          return [
            '✅ Investment recorded on-chain.',
            `• Amount: $${Number(inv?.vusdAmount || amount).toFixed(2)} VUSD`,
            `• Expected Earnings: $${earned.toFixed(2)} VUSD`,
            `• Maturity: ${inv?.maturedAt ? new Date(inv.maturedAt).toDateString() : '~'}`,
          ].join('\n');
        } catch (e: any) {
          return `Error finalizing investment: ${e?.message || String(e)}`;
        }
      }

      return [
        'Almost there! To join this pool:',
        '1) Open the app and send your VUSD to the escrow (you’ll get a transaction id).',
        '2) Paste the transaction id here and I’ll record your investment.',
        '',
        'If you don’t have VUSD yet, reply: TOPUP to fund via card/transfer.',
      ].join('\n');
    },
    {
      name: 'join_pool',
      description:
        'Record an investment for a user. If txId is provided, finalizes the investment by verifying the vUSD→escrow transfer on the mirror node.',
      schema: schema as any,
    },
  );
};
