import axios, { AxiosInstance } from "axios";
import investorService from "../investor/investor.service.js";
import { DecryptedResponse } from "./whatsapp.type.js";
import { PinService } from "../pin/pin.service.js";

const META_API_URL = "https://graph.facebook.com/v22.0";

export class WhatsAppService {
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

    /** Send a simple text message */
    async sendText(to: string, text: string): Promise<void> {
        try {
            await this.axiosInstance.post(
                `/${process.env.WHATSAPP_PHONE_ID}/messages`,
                {
                    messaging_product: "whatsapp",
                    to,
                    type: "text",
                    text: { body: text },
                }
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    /** Send a fully custom WhatsApp message payload (interactive, flow, etc.) */
    async sendMessage(data: Record<string, unknown>): Promise<void> {
        try {
            await this.axiosInstance.post(
                `/${process.env.WHATSAPP_PHONE_ID}/messages`,
                data
            );
            console.log(data, 'data===')
        } catch (error) {
            console.log(error, 'error')
            this.handleError(error);
        }
    }

    /** Handle flow navigation logic */
    async getNextScreen(decryptedBody: DecryptedResponse) {
        const { action, screen, data } = decryptedBody;
        if (action === "ping") return { data: { status: "active" } };

        switch (screen) {
            case "SET_PIN":
                if (data.pin) {
                    return {
                        screen: 'CONFIRM_PIN',
                        next: { type: "screen", name: "CONFIRM_PIN" },
                        data: { pin: Number(data?.pin) },
                    };
                }
                return {
                    next: { type: "screen", name: "CONFIRM_PIN" },
                    data: { pin: data?.pin },
                };


            case "CONFIRM_PIN": {
                if (data?.pin !== Number(data?.confirmPin)) {
                    return {
                        screen: 'SET_PIN',
                        next: { type: "screen", name: "PIN_MISMATCH" },
                        data: { message: "PINs do not match." },
                    };
                }

                const phoneNumber = data?.phoneNumber || decryptedBody.flow_token;
                const investor = await investorService.getInvestorByPhone(phoneNumber);
                if (investor) {
                    await PinService.setPin(String(investor._id), String(data.pin));
                }

                return {
                    screen: 'PIN_SUCCESS',
                    next: { type: "screen", name: "PIN_SUCCESS" },
                    data: { message: "Your PIN has been set successfully!" },
                };
            }

            case "ENTER_PIN": {
                const phoneNumber = data?.phoneNumber || decryptedBody.flow_token;
                const investor = await investorService.getInvestorByPhone(phoneNumber);
                if (!investor) {
                    return {
                        screen: "INVALID_PIN",
                        next: { type: "screen", name: "INVALID_PIN" },
                        data: { message: "Investor not found." },
                    };
                }
                const valid = await PinService.verifyPin(
                    String(investor._id),
                    String(data.pin)
                );

                if (!valid) {
                    console.log("❌ Invalid transaction PIN for", phoneNumber);
                    return {
                        screen: "INVALID_PIN",
                        next: { type: "screen", name: "INVALID_PIN" },
                        data: { message: "Invalid PIN entered." },
                    };
                }

                console.log("✅ PIN verified for transaction:", investor._id);
                return {
                    screen: "TRANSACTION_APPROVED",
                    next: { type: "screen", name: "TRANSACTION_APPROVED" },
                    data: { message: "Transaction approved successfully!" },
                };
            }


            case "PIN_MISMATCH":
                return {
                    screen: 'SET_PIN',
                    data: {},
                };

            default:
                return { data: { message: "Unknown flow stage." } };
        }
    }


    async sendWhatsAppFlow(
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
                header: {
                    type: "text",
                    text: flowName,
                },
                body: {
                    text:
                        params?.description ||
                        "Let's get started — please follow the steps below.",
                },
                footer: {
                    text: "Powered by Evolt ⚡️",
                },
                action: {
                    name: "flow",
                    parameters: {
                        flow_id: flowId,
                        flow_cta: flowName,
                        flow_token: to,
                        mode: "published",
                        flow_message_version:
                            process.env.WHATSAPP_FLOW_VERSION || "3",
                    },
                },
            },
        };

        try {
            const res = await this.axiosInstance.post(
                `/${process.env.WHATSAPP_PHONE_ID}/messages`,
                payload
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): void {
        if (axios.isAxiosError(error)) {
            console.error(
                "❌ WhatsApp API Error:",
                error.response?.data || error.message
            );
        } else {
            console.error("❌ Unexpected Error:", error);
        }
        throw new Error("Failed to send WhatsApp message");
    }
}

export default new WhatsAppService();