import mongoose, { Document, Schema } from "mongoose";

export interface InvoiceDoc extends Document {
    businessId: mongoose.Types.ObjectId;
    corporateId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    amount: number;
    currency?: string;
    status: "pending" | "verified" | "tokenized";
    verifier?: string;
    blobUrl?: string;
    tokenId?: string;
    tokenEvm?: string;
    escrowEvm?: string;
    initialSupply?: number;
    escrowContractId?: string;
    verifiedAt?: Date;
    hcsTxId?: string;
    tokenized?: boolean;
    yieldRate?: number;
    durationDays?: number;
    minInvestment?: number;
    maxInvestment?: number;
    totalTarget?: number;
    expiryDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const InvoiceSchema = new Schema<InvoiceDoc>(
    {
        businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        corporateId: { type: Schema.Types.ObjectId, ref: "Corporate", required: true },

        invoiceNumber: { type: String, required: true, unique: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        status: {
            type: String,
            enum: ["pending", "verified", "tokenized"],
            default: "pending",
        },
        verifier: { type: String },
        blobUrl: { type: String },

        tokenId: { type: String },
        tokenEvm: { type: String },
        escrowEvm: { type: String },
        escrowContractId: { type: String },
        initialSupply: { type: Number },
        tokenized: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        hcsTxId: { type: String },

        yieldRate: { type: Number, default: 0.1 },
        durationDays: { type: Number, default: 90 },
        minInvestment: { type: Number, default: 10 },
        maxInvestment: { type: Number, default: 10000 },
        totalTarget: { type: Number, default: 100000 },
        expiryDate: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
    },
    { timestamps: true }
);

export default mongoose.model<InvoiceDoc>("Invoicev1", InvoiceSchema);