import bcrypt from "bcrypt";
import { UserPinModel } from "./pin.model.js";
import { Types } from "mongoose";

export class PinService {
    static async setPin(userId: string | Types.ObjectId, pin: string) {
        const hashed = await bcrypt.hash(pin, 10);
        await UserPinModel.findOneAndUpdate(
            { userId },
            { hashedPin: hashed },
            { upsert: true, new: true }
        );
        return { message: "PIN saved successfully" };
    }

    static async verifyPin(userId: string | Types.ObjectId, pin: string) {
        const record = await UserPinModel.findOne({ userId });
        if (!record) return false;
        return await bcrypt.compare(pin, record.hashedPin);
    }

    static async deletePin(userId: string | Types.ObjectId) {
        await UserPinModel.deleteOne({ userId });
        return { message: "PIN removed successfully" };
    }
}