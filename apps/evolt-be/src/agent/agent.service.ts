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
import InvestorService from '../investor/investor.service.js';

// Temporary in-memory chat store (replace with Redis in production)
const chatHistoryStore = new Map<string, (HumanMessage | AIMessage)[]>();

const TREASURY_ID = process.env.HEDERA_OPERATOR_ID!;
const TREASURY_KEY = process.env.HEDERA_OPERATOR_KEY!;

export class AgentService {
  private agent: any;
  private tools!: any[];
  private ready: Promise<void>;           // <-- ensure agent is ready

  constructor(private app: FastifyInstance) {
    this.ready = this.initAgent();        // <-- await this in handleMessage
  }

  private async initAgent() {
    const llm = await initChatModel('openai:gpt-4o-mini', {
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const client = Client.forTestnet().setOperator(
      TREASURY_ID,
      TREASURY_KEY
    );

    const hederaToolkit = new HederaLangchainToolkit({
      client,
      configuration: { plugins: [coreQueriesPlugin, coreAccountPlugin, coreHTSPlugin] },
    });

    const stockTools = hederaToolkit.getTools();

    const greetUserTool = tool<any, any, string>(
      ({ name }) => `Hello ${name}, how can I assist you with RWAs today?`,
      { name: 'greet_user', description: 'Greets the user.', schema: z.object({ name: z.string() }) as any }
    );

    this.tools = [...stockTools, createGetRwaAssetsTool(), createGetPortfolioTool(), createConnectWalletTool(this.app)];
    this.agent = createAgent({ model: llm, tools: [...this.tools, greetUserTool] });
  }

  public async handleMessage(userId: string, input: string): Promise<string> {
    await this.ready; // <-- make sure agent is initialized

    const chat_history = chatHistoryStore.get(userId) || [];

    const userAccountId = (await InvestorService.findByPhone(userId))?.accountId;

    const contextInput = `
User Message: "${input}"

[User Context]
Phone Number: ${userId}
Hedera Account ID: ${userAccountId || 'Not yet connected'}
`;

    // invoke the agent
    const result = await this.agent.invoke({
      messages: [{ role: 'user', content: contextInput }],
    });

    // extract final text safely
    const last = result?.messages?.[result.messages.length - 1];
    const content =
      typeof last?.content === 'string'
        ? last.content
        : Array.isArray(last?.content)
          ? last.content.map((p: any) => (p?.type === 'text' ? p.text : '')).join('').trim()
          : '';

    // store history (use the real content)
    chat_history.push(new HumanMessage(input));
    chat_history.push(new AIMessage(content));
    chatHistoryStore.set(userId, chat_history);

    return content || 'Okay.';
  }
}
