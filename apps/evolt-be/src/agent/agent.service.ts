import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { initChatModel } from 'langchain/chat_models/universal';
import { createAgent, tool } from 'langchain';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { Client } from '@hashgraph/sdk';
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
  createWalletTool,
  createAssociateTokenTool,
  createPreviewEarningsTool,
  createJoinPoolTool,
  createFundWalletTool,
} from './agent.tools.js';
import InvestorService from '../investor/investor.service.js';
import { systemPrompt } from '../util/util.prompt.js';

const TREASURY_ID = process.env.HEDERA_OPERATOR_ID!;
const TREASURY_KEY = process.env.HEDERA_OPERATOR_KEY!;

export class AgentService {
  private agent: any;
  private tools!: any[];
  private ready: Promise<void>;

  constructor(private app: FastifyInstance) {
    this.ready = this.initAgent();
  }

  private async initAgent() {
    const llm = await initChatModel('openai:gpt-4o-mini');
    const client = Client.forTestnet().setOperator(TREASURY_ID, TREASURY_KEY);

    const hederaToolkit = new HederaLangchainToolkit({
      client,
      configuration: { plugins: [coreQueriesPlugin, coreAccountPlugin, coreHTSPlugin] },
    });

    const stockTools = hederaToolkit.getTools();

    const greetUserTool = tool<any, any, string>(
      ({ name }) => `Hello ${name}, how can I assist you with RWAs today?`,
      {
        name: 'greet_user',
        description: 'Greets the user.',
        schema: z.object({ name: z.string() }) as any,
      },
    );

    this.tools = [
      ...stockTools,
      createWalletTool(),
      createGetRwaAssetsTool(this.app),
      createGetPortfolioTool(),
      createConnectWalletTool(this.app),
      createAssociateTokenTool(this.app),
      createPreviewEarningsTool(),
      createJoinPoolTool(this.app),
      createFundWalletTool(this.app),
    ];

    this.agent = createAgent({
      model: llm,
      tools: [...this.tools, greetUserTool],
      systemPrompt,
    });
  }

  private async getChatHistory(phoneNumber: string): Promise<(HumanMessage | AIMessage)[]> {
    const data = await this.app.redis.get(`chat:${phoneNumber}`);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parsed.map((m: any) =>
        m.type === 'human'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      );
    } catch {
      return [];
    }
  }

  private async saveChatHistory(phoneNumber: string, history: (HumanMessage | AIMessage)[]) {
    const serialized = history.map(m => ({
      type: m._getType(),
      content: m.content,
    }));
    await this.app.redis.set(`chat:${phoneNumber}`, JSON.stringify(serialized), 'EX', 3600);
  }

  public async handleMessage(phoneNumber: string, input: string, name: string): Promise<string> {
    await this.ready;

    const chat_history = await this.getChatHistory(phoneNumber);
    const userAccountId = (await InvestorService.getInvestorByPhone(phoneNumber))?.accountId;

    const contextInput = `
    User Message: "${input}"
    name: ${name}
    [User Context]
    Phone Number: ${phoneNumber}
    Hedera Account ID: ${userAccountId || 'Not yet connected'}
    `;

    const messages = [
      ...chat_history,
      new HumanMessage(contextInput),
    ];

    const result = await this.agent.invoke({ messages });





    const last = result?.messages?.[result.messages.length - 1];
    const content =
      typeof last?.content === 'string'
        ? last.content
        : Array.isArray(last?.content)
          ? last.content.map((p: any) => (p?.type === 'text' ? p.text : '')).join('').trim()
          : '';

    chat_history.push(new HumanMessage(input));
    chat_history.push(new AIMessage(content));

    await this.saveChatHistory(phoneNumber, chat_history);

    return content || 'Okay.';
  }
}