import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
// Remove unused service
// import investorService from "../investor/investor.service.js";
// import { WalletService } from "../wallet/wallet.service.js";
import { AgentService } from '../agent/agent.service.js'; // Import the new service

export class WhatsAppController {
  // private walletConnect: WalletService; // No longer needed here
  private agentService: AgentService; // Add agent service

  constructor(private readonly fastify: FastifyInstance) {
    // this.walletConnect = new WalletService(fastify); // No longer needed here
    this.agentService = new AgentService(fastify); // Initialize the agent
  }

  verifyWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
    // ... (this method remains unchanged)
    const q = req.query as Record<string, string>;
    const mode = q['hub.mode'];
    const token = q['hub.verify_token'];
    const challenge = q['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      this.fastify.log.info('✅ WhatsApp webhook verified');
      return reply.code(200).send(challenge);
    }

    this.fastify.log.warn('❌ WhatsApp webhook verification failed');
    return reply.code(403).send({ error: 'Forbidden' });
  };

  handleIncoming = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any;
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      const from = message?.from; // This is the 'userId'
      const text = message?.text?.body?.trim(); // Don't lowercase, let the AI handle it

      if (!from || !text) return reply.code(200).send('NO_MESSAGE');

      // 🛑 REMOVE old static logic
      // if (text === "connect wallet") { ... }

      // ✨ ADD new agent logic
      // 1. Get response from the AI agent
      const agentResponse = await this.agentService.handleMessage(from, text);

      // 2. Send the agent's response back to the user
      await this.sendWhatsAppMessage(from, agentResponse);

      return reply.code(200).send();
    } catch (err: any) {
      this.fastify.log.error('❌ WhatsApp error:', err);
      // Send a fallback message to the user
      if (
        (req.body as any)?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from
      ) {
        const from = (req.body as any).entry[0].changes[0].value.messages[0]
          .from;
        await this.sendWhatsAppMessage(
          from,
          'Sorry, I ran into an error. Please try again in a moment.',
        );
      }
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  };

  private async sendWhatsAppMessage(to: string, message: string) {
    // ... (this method remains unchanged)
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
