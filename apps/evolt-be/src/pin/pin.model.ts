import mongoose, { Schema, Document } from "mongoose";
import { UserPin } from "./pin.type";



const UserPinSchema = new Schema<UserPin>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "Investor", unique: true },
        hashedPin: { type: String, required: true }
    },
    { timestamps: true }
);

export const UserPinModel = mongoose.model<UserPin>("UserPin", UserPinSchema);