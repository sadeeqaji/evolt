import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import crypto from "crypto";
import { PaystackEvent, SuccessfulChargeEvent } from "./paystack.types.js";
import { WhatsAppService } from "../whatsapp/whatsapp.service.js";
import { WalletService } from "../wallet/wallet.service.js";
import PaystackService from "./paystack.service.js";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_WHITELIST_IPS = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];

export class PaystackController {
    private readonly paystackService: PaystackService;
    private whatsappService: WhatsAppService;

    constructor(private readonly fastify: FastifyInstance) {
        this.paystackService = new PaystackService(fastify);
        this.whatsappService = new WhatsAppService(fastify);

    }

    /** ------------------------------------------------------------------
     * Validate webhook signature
     * ------------------------------------------------------------------ */
    private validateSignature(request: FastifyRequest, rawBody: Buffer): boolean {
        const signature = request.headers["x-paystack-signature"] as string;
        if (!signature) return false;

        const computed = crypto
            .createHmac("sha512", PAYSTACK_SECRET)
            .update(rawBody)
            .digest("hex");

        return computed === signature;
    }

    /** ------------------------------------------------------------------
     * Optional IP whitelist check
     * ------------------------------------------------------------------ */
    private isWhitelistedIp(ip?: string): boolean {
        return !!ip && PAYSTACK_WHITELIST_IPS.includes(ip);
    }

    /** ------------------------------------------------------------------
     * 💳 Handle charge.success event
     * ------------------------------------------------------------------ */
    private async handleSuccessfulCharge(event: SuccessfulChargeEvent): Promise<void> {
        const reference = event.data.reference;
        const amount = event.data.amount / 100;
        const NGN_TO_USD_RATE = Number(process.env.NGN_TO_USD_RATE || 1489);
        const amountUsd = amount / NGN_TO_USD_RATE;
        const phone = event.data.metadata?.phone || event.data.customer?.phone;
        if (!phone) {
            this.fastify.log.error(`❌ Missing phone number in metadata for ref: ${reference}`);
            return;
        }

        try {



            await WalletService.credit(phone, amountUsd);


            const message = `✅ *Wallet Funding Successful!*
Your wallet has been credited with $${amountUsd.toFixed(2)}.
You can now invest in available real-world assets by saying:
*Show available investments*`
            await this.whatsappService.sendText(phone, message);

            this.fastify.log.info(
                `✅ Processed Paystack payment — Phone: ${phone}, Amount: $${amountUsd}, Ref: ${reference}`
            );
        } catch (err: any) {
            this.fastify.log.error(`❌ Error handling successful charge: ${err.message}`);
        }
    }


    webhook = async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const rawBody = req.rawBody as Buffer;
            if (!this.validateSignature(req, rawBody)) {
                this.fastify.log.warn("⚠️ Invalid Paystack signature");
                return reply.code(401).send({ error: "Invalid signature" });
            }

            const event = JSON.parse(rawBody.toString()) as PaystackEvent;
            if (!event.event || !event.data) {
                this.fastify.log.warn("⚠️ Invalid event structure received from Paystack");
                return reply.code(400).send({ error: "Invalid event structure" });
            }

            // const clientIp =
            //     req.ip || (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim();

            // Optional IP whitelist check
            // if (!this.isWhitelistedIp(clientIp)) {
            //   this.fastify.log.warn(`Unauthorized IP: ${clientIp}`);
            //   return reply.code(403).send({ error: "IP not whitelisted" });
            // }

            if (event.event === "charge.success") {
                await this.handleSuccessfulCharge(event as SuccessfulChargeEvent);
            } else {
                this.fastify.log.info(`Unhandled Paystack event: ${event.event}`);
            }

            return reply.code(200).send({ status: "success", message: "Webhook received" });
        } catch (err: any) {
            this.fastify.log.error("❌ Paystack Webhook Error:", err);

            try {
                const rawBody = req.rawBody?.toString() || "";
                this.fastify.log.error({ msg: "Raw Body", body: rawBody.slice(0, 200) });
            } catch (_) { }

            return reply.code(500).send({ error: "Internal Server Error" });
        }
    };
}

export default PaystackController;