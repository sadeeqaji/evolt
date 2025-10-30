import {
    Client,
    PrivateKey,
    AccountId,
    TokenId,
    TransferTransaction,
    AccountBalanceQuery,
    TransactionReceipt,
} from "@hashgraph/sdk";

class HederaService {
    private client: Client;

    constructor(network: "testnet" | "mainnet" = "testnet") {
        this.client =
            network === "mainnet" ? Client.forMainnet() : Client.forTestnet();

        if (process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY) {
            this.client.setOperator(
                process.env.HEDERA_OPERATOR_ID,
                process.env.HEDERA_OPERATOR_KEY
            );
        }
    }

    /**
     * ✅ Transfer HTS tokens between two accounts
     */
    async transferToken(params: {
        senderId: string;
        senderPrivateKey: PrivateKey;
        receiverId: string;
        tokenId: string;
        amount: number;
    }): Promise<TransactionReceipt> {
        const { senderId, senderPrivateKey, receiverId, tokenId, amount } = params;

        const senderAccountId = AccountId.fromString(senderId);
        // const senderKey = PrivateKey.fromString(senderPrivateKey);
        const receiverAccountId = AccountId.fromString(receiverId);
        const token = TokenId.fromString(tokenId);

        this.client.setOperator(senderAccountId, senderPrivateKey);

        const transaction = new TransferTransaction()
            .addTokenTransfer(token, senderAccountId, -amount)
            .addTokenTransfer(token, receiverAccountId, amount)
            .freezeWith(this.client);

        const signedTx = await transaction.sign(senderPrivateKey);
        const txResponse = await signedTx.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);

        return receipt;
    }

    /**
     * ✅ Get VUSD or HBAR balance for a specific account
     */
    async getAccountBalance(
        accountId: string,
        tokenId?: string
    ): Promise<number> {
        const balance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(this.client);
        console.log(tokenId)
        if (tokenId) {
            const token = TokenId.fromString(tokenId);
            const tokenBalance =
                balance.tokens?._map.get(token.toString())?.toNumber() || 0;
            return tokenBalance / 1e6;
        }
        console.log(balance, 'balance')
        return balance.hbars.toBigNumber().toNumber();
    }
}

export default new HederaService();