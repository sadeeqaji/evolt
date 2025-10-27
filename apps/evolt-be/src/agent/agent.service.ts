import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { initChatModel } from 'langchain/chat_models/universal';
import { createAgent, tool } from 'langchain';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { Client, PrivateKey } from '@hashgraph/sdk';
import {
  HederaLangchainToolkit,
  coreQueriesPlugin,
  coreAccountPlugin,
  coreHTSPlugin,
} from 'hedera-agent-kit';
import {
  createGetRwaAssetsTool,
  createGetPortfolioTool,
  createConnectWalletTool,
} from './agent.tools.js';
import { investorService } from './investor.service.js'; // ✅ make sure this import exists

// Temporary in-memory chat store (replace with Redis in production)
const chatHistoryStore = new Map<string, (HumanMessage | AIMessage)[]>();

export class AgentService {
  private agent: any;
  private tools!: any[];

  constructor(private app: FastifyInstance) {
    this.initAgent();
  }

  private async initAgent() {
    /** 1️⃣ Initialize LLM using the new unified API */
    const llm = await initChatModel('openai:gpt-4o-mini');

    /** 2️⃣ Initialize Hedera Client */
    const client = Client.forTestnet().setOperator(
      process.env.ACCOUNT_ID!,
      PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY!),
    );

    /** 3️⃣ Initialize Hedera Toolkit & Core Plugins */
    const hederaToolkit = new HederaLangchainToolkit({
      client,
      configuration: {
        plugins: [coreQueriesPlugin, coreAccountPlugin, coreHTSPlugin],
      },
    });

    const stockTools = hederaToolkit.getTools();

    /** 4️⃣ Create Custom Tools */
    const customTools = [
      createGetRwaAssetsTool(),
      createGetPortfolioTool(),
      createConnectWalletTool(this.app),
    ];

    this.tools = [...stockTools, ...customTools];

    const greetUserTool = tool<any, any, string>(
      ({ name }) => `Hello ${name}, how can I assist you with RWAs today?`,
      {
        name: 'greet_user',
        description: 'Greets the user politely and starts the conversation.',
        // 👇 cast schema to any to prevent infinite type expansion
        schema: z.object({ name: z.string() }) as any,
      },
    );

    /** 6️⃣ Create the Agent using the modern API */
    this.agent = createAgent({
      model: llm,
      tools: [...this.tools, greetUserTool],
    });
  }

  /**
   * Handles incoming user messages and returns the AI's response
   */
  public async handleMessage(userId: string, input: string): Promise<string> {
    const chat_history = chatHistoryStore.get(userId) || [];

    // Lookup Hedera account if linked
    const userAccountId = (await investorService.findByPhone(userId))
      ?.accountId;

    const contextInput = `
User Message: "${input}"

[User Context]
Phone Number: ${userId}
Hedera Account ID: ${userAccountId || 'Not yet connected'}
`;

    /** 🔹 Use the modern invoke pattern */
    const response = await this.agent.invoke({
      messages: [{ role: 'user', content: contextInput }],
    });

    /** 🔹 Store chat history */
    chat_history.push(new HumanMessage(input));
    chat_history.push(new AIMessage(response.output));
    chatHistoryStore.set(userId, chat_history);

    return response.output;
  }
}
