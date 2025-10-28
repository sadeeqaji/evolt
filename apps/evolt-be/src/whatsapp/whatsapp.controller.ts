import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';

import { AgentService } from '../agent/agent.service.js';

export class WhatsAppController {
  private agentService: AgentService;

  constructor(private readonly fastify: FastifyInstance) {
    this.agentService = new AgentService(fastify);
  }

  verifyWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
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
      const from = message?.from;
      const text = message?.text?.body?.trim();

      const contact = body?.entry[0]?.changes[0]?.value.contacts?.[0];
      const username = contact?.profile?.name || 'there'

      if (!from || !text) return reply.code(200).send('NO_MESSAGE');

      await this.sendTypingIndicator(message.id);


      // ✨ ADD new agent logic
      // 1. Get response from the AI agent
      const agentResponse = await this.agentService.handleMessage(from, text, username);

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


  private async sendTypingIndicator(messageId: string) {
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
        typing_indicator: { type: 'text' },
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


