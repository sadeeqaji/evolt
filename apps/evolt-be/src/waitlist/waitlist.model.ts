import mongoose, { Document, Schema } from "mongoose";

export interface IWaitlistEntry extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    accountType: "investor" | "business";
    source?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WaitlistSchema = new Schema<IWaitlistEntry>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phoneNumber: String,
        accountType: { type: String, enum: ["investor", "business"], default: "investor" },
        source: String,
    },
    { timestamps: true }
);

export const WaitlistModel = mongoose.model<IWaitlistEntry>(
    "WaitlistEntry",
    WaitlistSchema
);
