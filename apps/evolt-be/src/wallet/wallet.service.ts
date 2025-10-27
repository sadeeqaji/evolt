import {
    PrivateKey,
    Client,
    TokenAssociateTransaction,
    TokenId,
    AccountInfoQuery,
    Hbar,
    TransferTransaction,
    AccountCreateTransaction,
} from "@hashgraph/sdk";
import { storeUserKey, getUserKey } from "../util/util.manage-key.js";
import crypto from "crypto";
import { FastifyInstance } from "fastify";
import InvestorService from "../investor/investor.service.js";

const TREASURY_ID = process.env.HEDERA_OPERATOR_ID!;
const TREASURY_KEY = process.env.HEDERA_OPERATOR_KEY!;

const hederaClient = Client.forTestnet().setOperator(
    TREASURY_ID,
    PrivateKey.fromString(TREASURY_KEY)
);

export class WalletService {
    constructor(private app: FastifyInstance) { }

    static async createWallet(phoneNumber: string) {
        try {
            const privateKey = PrivateKey.generateED25519();
            const publicKey = privateKey.publicKey;

            const tx = await new AccountCreateTransaction()
                .setKey(publicKey)
                .setInitialBalance(Hbar.fromTinybars(1))
                .execute(hederaClient);

            const receipt = await tx.getReceipt(hederaClient);
            const accountId = receipt.accountId?.toString();
            if (!accountId) throw new Error("Account creation receipt missing accountId");

            await storeUserKey(phoneNumber, privateKey);

            try {
                await InvestorService.linkAccountId(phoneNumber, accountId, publicKey.toStringRaw());
            } catch (_) { /* non-fatal */ }

            return {
                success: true,
                accountId,
                publicKey: publicKey.toStringRaw(),
                message:
                    "Wallet created successfully! It has 1 tinybar (0.00000001 HBAR). Top up before having the account pay fees itself.",
            };
        } catch (err: any) {
            console.error("WalletService.createWallet() failed:", err);
            throw new Error(`Wallet creation failed: ${err.message}`);
        }
    }

    static async getPrivateKey(userId: string): Promise<PrivateKey> {
        return await getUserKey(userId);
    }

    async initiateWalletConnect(phoneNumber: string) {
        const nonce = crypto.randomBytes(32).toString("hex");
        const challenge = `Evolt verification:\n\nSign this message to verify your wallet.\nNonce: ${nonce}`;
        await this.app.redis.set(`wallet_nonce:${phoneNumber}`, nonce, "EX", 300);
        const connectLink = `https://hashpack.app/sign?message=${encodeURIComponent(challenge)}`;
        return { challenge, connectLink };
    }

    private async ensureMinBalance(accountId: string, minTinybars = 500_000) {
        const bal = await (await new AccountInfoQuery().setAccountId(accountId).execute(hederaClient)).balance;
        const balTinybars = bal.toTinybars().toNumber();
        if (balTinybars >= minTinybars) return;

        const delta = Hbar.fromTinybars(minTinybars - balTinybars);
        await new TransferTransaction()
            .addHbarTransfer(TREASURY_ID, delta.negated())
            .addHbarTransfer(accountId, delta)
            .execute(hederaClient)
            .then(tx => tx.getReceipt(hederaClient));
    }


    static async associateTokenFor(phoneNumber: string, tokenId: string) {
        // 1) Look up investor + key
        const investor = await InvestorService.findByPhone(phoneNumber);
        if (!investor?.accountId)
            throw new Error("No Hedera account linked. Ask the user to create/connect a wallet.");

        const userKey = await WalletService.getPrivateKey(phoneNumber);
        if (!userKey) throw new Error("User private key not found for this phone number.");

        const accountId = investor.accountId;
        const token = TokenId.fromString(tokenId);

        // 2) Avoid duplicate association
        const info = await new AccountInfoQuery().setAccountId(accountId).execute(hederaClient);
        const already = info.tokenRelationships.get(token.toString());
        if (already) {
            return {
                success: true,
                message: `Account ${accountId} is already associated with ${tokenId}.`
            };
        }

        const svc = new WalletService({} as any);
        await svc.ensureMinBalance(accountId).catch(() => { /* non-fatal */ });

        const tx = await new TokenAssociateTransaction()
            .setAccountId(accountId)
            .setTokenIds([token])
            .freezeWith(hederaClient);

        const signed = await tx.sign(userKey);
        const submitted = await signed.execute(hederaClient);
        const receipt = await submitted.getReceipt(hederaClient);

        return {
            success: receipt.status.toString() === "SUCCESS",
            status: receipt.status.toString(),
            message: `✅ Associated ${accountId} with ${tokenId} (status: ${receipt.status.toString()}).`
        };
    }
}