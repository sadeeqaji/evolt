import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import crypto from 'crypto';

import { AgentService } from '../agent/agent.service.js';
import { encryptResponse, decryptRequestBody } from '../util/util.whatsapp-encryption.js';
import { DecryptRequestBody, DecryptedResponse } from './whatsapp.type.js';
import WhatsAppService from './whatsapp.service.js';

const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET!;
const WHATSAPP_PRIVATE_KEY = process.env.WHATSAPP_PRIVATE_KEY!;
const PRIVATE_KEY_PASSPHRASE = process.env.PRIVATE_KEY_PASSPHRASE!;

export class WhatsAppController {
  private agentService: AgentService;

  constructor(private readonly fastify: FastifyInstance) {
    this.agentService = new AgentService(fastify);
  }

  /**
   * Verify WhatsApp webhook (GET)
   */
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

  /**
   * Handle normal incoming WhatsApp text messages
   */
  handleIncoming = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body: any = req.body;
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      const metadata = change?.value?.metadata;
      const phoneNumberId = metadata?.phone_number_id;
      const from = message?.from;
      const text = message?.text?.body?.trim();

      if (from === phoneNumberId) return reply.code(200).send('IGNORED_OUTBOUND');
      if (!from || !text) return reply.code(200).send('NO_MESSAGE');

      const messageId = message.id;
      await this.sendTypingIndicator(messageId);

      const isDuplicate = await this.fastify.redis.get(messageId);
      if (isDuplicate) return reply.code(200).send('DUPLICATE_MESSAGE');
      await this.fastify.redis.setex(messageId, 3600, 'seen');

      const contact = change?.value?.contacts?.[0];
      const username = contact?.profile?.name || 'there';

      const agentResponse = await this.agentService.handleMessage(from, text, username);
      await this.sendWhatsAppMessage(from, agentResponse);

      return reply.code(200).send();
    } catch (err: any) {
      this.fastify.log.error('❌ WhatsApp error:', err);
      const from =
        (req.body as any)?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
      if (from) {
        await this.sendWhatsAppMessage(
          from,
          'Sorry, I ran into an error. Please try again shortly.'
        );
      }
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  };

  /**
   * Handle encrypted WhatsApp Flow webhooks (Change PIN, etc.)
   */
  handleFlowWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!this.isRequestSignatureValid(req)) {
        return reply.status(432).send();
      }
      const body = req.body as DecryptRequestBody;
      let decryptedRequest;
      try {
        decryptedRequest = decryptRequestBody(body, WHATSAPP_PRIVATE_KEY, PRIVATE_KEY_PASSPHRASE);
      } catch (err: any) {
        req.log.error('Error decrypting request:', err);
        return reply.status(500).send();
      }

      const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
      req.log.info(`💬 Decrypted Request: ${JSON.stringify(decryptedBody)}`);

      const screenResponse: Record<string, unknown> =
        (await WhatsAppService.getNextScreen(decryptedBody as unknown as DecryptedResponse)) || {};
      req.log.info(`👉 Response to Encrypt: ${JSON.stringify(screenResponse)}`);

      const encryptedResponse = encryptResponse(
        screenResponse,
        aesKeyBuffer,
        initialVectorBuffer
      );

      return reply.send(encryptedResponse);
    } catch (error: any) {
      req.log.error('Error processing WhatsApp Flow webhook:', error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  };

  /**
   * Verify incoming webhook signature (Meta)
   */
  private isRequestSignatureValid = (req: FastifyRequest): boolean => {
    if (!WHATSAPP_APP_SECRET) {
      req.log.warn('App Secret not set — skipping signature validation.');
      return true;
    }

    const signatureHeader = req.headers['x-hub-signature-256'];
    if (!signatureHeader) {
      req.log.error('Missing signature header');
      return false;
    }

    const signatureBuffer = Buffer.from(
      (Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader).replace('sha256=', ''),
      'utf-8'
    );

    const hmac = crypto.createHmac('sha256', WHATSAPP_APP_SECRET);
    const rawBody = req.rawBody!;
    const digestString = hmac.update(rawBody).digest('hex');
    const digestBuffer = Buffer.from(digestString, 'utf-8');

    req.log.info(`Calculated Digest: ${digestString}`);
    req.log.info(`Received Signature: ${signatureBuffer.toString('utf-8')}`);
    return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
  };



  /**
   * Send plain WhatsApp message
   */
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
      }
    );
  }

  /**
   * Send typing indicator (UX polish)
   */
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
      }
    );
  }
}