import { FastifySchema } from "fastify";

const WaitlistEntrySchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        phoneNumber: { type: "string", nullable: true },
        accountType: { type: "string", enum: ["investor", "business"] },
        source: { type: "string", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" }
    }
};

export const JoinWaitlistSchema: FastifySchema = {
    description: "Join the EVOLT waitlist",
    tags: ["waitlist"],
    body: {
        type: "object",
        required: ["firstName", "lastName", "email"],
        properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            phoneNumber: { type: "string" },
            accountType: { type: "string", enum: ["investor", "business"] },
            source: { type: "string" }
        }
    },
    response: {
        201: {
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: WaitlistEntrySchema
            }
        }
    }
};

export const GetWaitlistSchema: FastifySchema = {
    description: "Fetch all waitlist entries (admin only)",
    tags: ["waitlist"],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: "object",
            properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: {
                    type: "array",
                    items: WaitlistEntrySchema
                }
            }
        }
    }
};
