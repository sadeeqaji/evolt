import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { UserPinModel } from "./pin.model.js";
import investorService from "../investor/investor.service.js";
import axios, { AxiosInstance } from "axios";

const FLOW_ID_SETUP_PIN = 825971416509314;
const FLOW_ID_ENTER_TRANSACTION = 1183982320271062;
const META_API_URL = "https://graph.facebook.com/v22.0";

/**
 * Handles secure PIN management, WhatsApp Flow triggers,
 * and authorization verification for sensitive transactions.
 */
export class PinService {
    private readonly axiosInstance: AxiosInstance;

    constructor(axiosInstance?: AxiosInstance) {
        this.axiosInstance =
            axiosInstance ||
            axios.create({
                baseURL: META_API_URL,
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
            });
    }

    /** ----------------------------------------------------------------
     *  WhatsApp helper
     * ---------------------------------------------------------------- */
    private async sendWhatsAppFlow(
        to: string,
        flowId: number,
        flowName: string,
        params?: Record<string, unknown>
    ): Promise<void> {
        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "flow",
                header: { type: "text", text: flowName },
                body: {
                    text:
                        params?.description ||
                        "Let's get started — please follow the steps below.",
                },
                footer: { text: "Powered by Evolt ⚡️" },
                action: {
                    name: "flow",
                    parameters: {
                        flow_id: flowId,
                        flow_cta: flowName,
                        flow_token: to,
                        mode: "published",
                        flow_message_version: process.env.WHATSAPP_FLOW_VERSION || "3",
                    },
                },
            },
        };

        try {
            await this.axiosInstance.post(
                `/${process.env.WHATSAPP_PHONE_ID}/messages`,
                payload
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): void {
        if (axios.isAxiosError(error)) {
            console.error("❌ WhatsApp API Error:", error.response?.data || error.message);
        } else {
            console.error("❌ Unexpected Error:", error);
        }
    }

    /** ----------------------------------------------------------------
     *  PIN management
     * ---------------------------------------------------------------- */

    /** Set or update a user's PIN */
    async setPin(userId: string | Types.ObjectId, pin: string) {
        const hashed = await bcrypt.hash(pin, 10);
        await UserPinModel.findOneAndUpdate(
            { userId },
            { hashedPin: hashed },
            { upsert: true, new: true }
        );
        return { message: "PIN saved successfully" };
    }

    /** Verify user-entered PIN */
    async verifyPin(userId: string | Types.ObjectId, pin: string) {
        const record = await UserPinModel.findOne({ userId });
        if (!record) return false;
        return await bcrypt.compare(pin, record.hashedPin);
    }

    /** Delete a PIN (e.g. user resets) */
    async deletePin(userId: string | Types.ObjectId) {
        await UserPinModel.deleteOne({ userId });
        return { message: "PIN removed successfully" };
    }

    async hasPin(userId: string | Types.ObjectId) {
        const record = await UserPinModel.findOne({ userId });
        return !!record;
    }

    /** ----------------------------------------------------------------
     *  WhatsApp-integrated transaction flows
     * ---------------------------------------------------------------- */

    /** Ensure PIN exists, otherwise trigger WhatsApp setup flow */
    async ensurePin(phoneNumber: string): Promise<boolean> {
        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor) throw new Error("Investor not found");

        const hasPin = await this.hasPin(String(investor._id));
        if (hasPin) return true;

        await this.sendWhatsAppFlow(phoneNumber, FLOW_ID_SETUP_PIN, "Set Transaction PIN");
        console.log(`📲 Triggered WhatsApp flow for ${phoneNumber} to set PIN`);
        return false;
    }

    /** Send WhatsApp authorization flow for a secure action */
    async requestAuthorization(phoneNumber: string, actionName: string): Promise<void> {
        await this.sendWhatsAppFlow(
            phoneNumber,
            FLOW_ID_ENTER_TRANSACTION,
            `Authorize ${actionName}`
        );
        console.log(`📲 Sent authorization flow to ${phoneNumber} for action: ${actionName}`);
    }

    /** Verify authorization (PIN check) */
    async verifyAuthorization(userId: string, pin: string): Promise<boolean> {
        return await this.verifyPin(userId, pin);
    }

    /** Reset PIN and optionally trigger setup flow again */
    async resetPin(phoneNumber: string, triggerSetup = false) {
        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor) throw new Error("Investor not found");
        await this.deletePin(String(investor._id));

        if (triggerSetup) {
            await this.sendWhatsAppFlow(phoneNumber, FLOW_ID_SETUP_PIN, "Reset Transaction PIN");
        }

        return { message: "PIN reset successfully" };
    }
}

export const pinService = new PinService();
export default pinService;