import mongoose, { Document } from "mongoose";

export interface UserPin extends Document {
    userId: mongoose.Types.ObjectId;
    hashedPin: string;
    createdAt?: Date;
    updatedAt?: Date;
}