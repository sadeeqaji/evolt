import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { UserPinModel } from "./pin.model.js";
import investorService from "../investor/investor.service.js";
import whatsappService from "../whatsapp/whatsapp.service.js";

/**
 * Handles secure PIN management, WhatsApp Flow triggers,
 * and authorization verification for sensitive transactions.
 */

const FLOW_ID_SETUP_PIN = 2019102395595026;
const FLOW_ID_ENTER_TRANSACTION = 1096917475849034;

export class PinService {

    /** Set or update a user's PIN */
    static async setPin(userId: string | Types.ObjectId, pin: string) {

        const hashed = await bcrypt.hash(pin, 10);
        await UserPinModel.findOneAndUpdate(
            { userId },
            { hashedPin: hashed },
            { upsert: true, new: true }
        );
        return { message: "PIN saved successfully" };
    }

    /** Verify user-entered PIN */
    static async verifyPin(userId: string | Types.ObjectId, pin: string) {
        const record = await UserPinModel.findOne({ userId });
        if (!record) return false;
        return await bcrypt.compare(pin, record.hashedPin);
    }

    /** Delete a PIN (e.g. user resets) */
    static async deletePin(userId: string | Types.ObjectId) {
        await UserPinModel.deleteOne({ userId });
        return { message: "PIN removed successfully" };
    }

    static async hasPin(userId: string | Types.ObjectId) {
        const record = await UserPinModel.findOne({ userId });
        return !!record;
    }



    static async ensurePin(phoneNumber: string): Promise<boolean> {
        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor) throw new Error("Investor not found");

        const hasPin = await this.hasPin(String(investor._id));
        if (hasPin) return true;

        await whatsappService.sendWhatsAppFlow(phoneNumber, FLOW_ID_SETUP_PIN, "Set Transaction PIN");
        console.log(`📲 Triggered WhatsApp flow for ${phoneNumber} to set PIN`);
        return false;
    }


    static async requestAuthorization(phoneNumber: string, actionName: string): Promise<void> {
        await whatsappService.sendWhatsAppFlow(phoneNumber, FLOW_ID_ENTER_TRANSACTION, `Authorize ${actionName}`);
        console.log(`📲 Sent authorization flow to ${phoneNumber} for action: ${actionName}`);
    }


    static async verifyAuthorization(userId: string, pin: string): Promise<boolean> {
        return await this.verifyPin(userId, pin);
    }


    static async resetPin(phoneNumber: string, triggerSetup = false) {
        const investor = await investorService.getInvestorByPhone(phoneNumber);
        if (!investor) throw new Error("Investor not found");
        await this.deletePin(String(investor._id));

        if (triggerSetup) {
            await whatsappService.sendWhatsAppFlow(phoneNumber, FLOW_ID_SETUP_PIN, "Reset Transaction PIN");
        }

        return { message: "PIN reset successfully" };
    }
}

export default PinService;