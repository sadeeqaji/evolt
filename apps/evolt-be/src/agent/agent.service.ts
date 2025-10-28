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
} from './agent.tools.js';
import InvestorService from '../investor/investor.service.js';
import { systemPrompt } from '@util/prompt.js';

const chatHistoryStore = new Map<string, (HumanMessage | AIMessage)[]>();

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
      configuration: {
        plugins: [coreQueriesPlugin, coreAccountPlugin, coreHTSPlugin],
      },
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
      createGetRwaAssetsTool(),
      createGetPortfolioTool(),
      createConnectWalletTool(this.app),
      createAssociateTokenTool(this.app),
      createPreviewEarningsTool(),
      createJoinPoolTool(),
    ];
    this.agent = createAgent({
      model: llm,
      tools: [...this.tools, greetUserTool],
      systemPrompt,
    });
  }

  public async handleMessage(
    userId: string,
    input: string,
    name: string,
  ): Promise<string> {
    await this.ready;

    const chat_history = chatHistoryStore.get(userId) || [];

    const userAccountId = (await InvestorService.findByPhone(userId))
      ?.accountId;

    const contextInput = `
    User Message: "${input}"
    name: ${name}
    [User Context]
    Phone Number: ${userId}
    Hedera Account ID: ${userAccountId || 'Not yet connected'}
`;

    const result = await this.agent.invoke({
      messages: [{ role: 'user', content: contextInput }],
    });

    const last = result?.messages?.[result.messages.length - 1];
    const content =
      typeof last?.content === 'string'
        ? last.content
        : Array.isArray(last?.content)
          ? last.content
              .map((p: any) => (p?.type === 'text' ? p.text : ''))
              .join('')
              .trim()
          : '';

    chat_history.push(new HumanMessage(input));
    chat_history.push(new AIMessage(content));
    chatHistoryStore.set(userId, chat_history);

    return content || 'Okay.';
  }
}
