import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { FastifyInstance } from 'fastify';

import poolService from '../pool/pool.service.js';
import investorService from '../investor/investor.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { WalletService as WalletCreator } from '../wallet/wallet.service.js';

/**
 * 1️⃣ Get available RWA assets
 */
export const createGetRwaAssetsTool = () => {
  const getRwaAssetsSchema = z.object({
    status: z
      .string()
      .optional()
      .describe("Filter by status: 'funding', 'funded', 'fully_funded'"),
    search: z
      .string()
      .optional()
      .describe('A search term to filter pools by name'),
  });

  return tool(
    async (input: z.infer<typeof getRwaAssetsSchema>) => {
      const { status, search } = input;
      try {
        const result = await poolService.listPools({
          status: status as any,
          search,
          page: 1,
          limit: 5,
        });

        return JSON.stringify(
          result.items.map((item: any) => ({
            name: item.projectName,
            yield: item.yieldRate,
            progress: item.fundingProgress,
            daysLeft: item.daysLeft,
          })),
        );
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

/**
 * 2️⃣ Get user portfolio
 */
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

/**
 * 3️⃣ Connect wallet
 */
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
        const existing = await investorService.findByPhone(phoneNumber);
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
      schema: connectWalletSchema as any, // 👈 fix
    },
  );
};

/**
 * 4️⃣ Create new wallet
 */
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
        return `Wallet created successfully! Your new account alias is ${result.alias}. Please fund this account to activate it.`;
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
