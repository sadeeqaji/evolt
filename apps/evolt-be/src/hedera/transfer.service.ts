import { Client, TransferTransaction, PrivateKey, AccountId, TokenId } from "@hashgraph/sdk";

class HederaTransferService {
    private client;

    constructor(network: "testnet" | "mainnet" = "testnet") {
        if (network === "testnet") {
            this.client = Client.forTestnet();
        } else {
            this.client = Client.forMainnet();
        }
    }

    async transferToken(params: {
        senderId: string;
        senderPrivateKey: string;
        receiverId: string;
        tokenId: string;
        amount: number;
    }) {
        const { senderId, senderPrivateKey, receiverId, tokenId, amount } = params;

        const senderAccountId = AccountId.fromString(senderId);
        const senderKey = PrivateKey.fromString(senderPrivateKey);
        const receiverAccountId = AccountId.fromString(receiverId);
        const token = TokenId.fromString(tokenId);

        this.client.setOperator(senderAccountId, senderKey);

        const transaction = new TransferTransaction()
            .addTokenTransfer(token, senderAccountId, -amount)
            .addTokenTransfer(token, receiverAccountId, amount)
            .freezeWith(this.client);

        const signedTx = await transaction.sign(senderKey);

        const txResponse = await signedTx.execute(this.client);

        const receipt = await txResponse.getReceipt(this.client);

        return receipt;
    }
}

export default new HederaTransferService();
