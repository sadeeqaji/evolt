import { useState, useCallback } from "react";
import {
  TransferTransaction,
  TokenId,
  Client,
  TransactionId,
  TransactionReceiptQuery,
  LedgerId,
} from "@hashgraph/sdk";
import { useHWBridge } from "@evolt/components/common/HWBridgeClientProvider";
import { transactionToBase64String } from "@evolt/lib/utils";
import apiClient from "@evolt/lib/apiClient";

interface SwapParams {
  usdcTokenId: string;
  userAccountId: string;
  treasuryAccountId: string;
  amount: number;
}

interface UseTokenSwapResult {
  loading: boolean;
  success: boolean;
  swap: (params: SwapParams) => Promise<boolean>;
}

/**
 * Handles a two-step token swap:
 * 1. User sends USDC → Treasury
 * 2. Backend confirms and sends VSUD → User
 */
export function useTokenSwap(): UseTokenSwapResult {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { sdk } = useHWBridge();

  const swap = useCallback(
    async (params: SwapParams): Promise<boolean> => {
      const { usdcTokenId, userAccountId, treasuryAccountId, amount } = params;
      const convertedAmount = amount * 1e6;

      try {
        setLoading(true);
        setSuccess(false);

        // 1️⃣ Create USDC transfer transaction
        const usdcTx = new TransferTransaction()
          .addTokenTransfer(
            TokenId.fromString(usdcTokenId),
            userAccountId,
            -convertedAmount
          )
          .addTokenTransfer(
            TokenId.fromString(usdcTokenId),
            treasuryAccountId,
            convertedAmount
          )
          .setTransactionId(TransactionId.generate(userAccountId));

        // 2️⃣ Sign and execute through Hashinals WalletConnect SDK
        const trans: any = await sdk?.dAppConnector.signAndExecuteTransaction({
          signerAccountId: userAccountId,
          transactionList: transactionToBase64String(usdcTx),
        });

        if (!trans?.transactionId) {
          console.error("Transaction broadcast failed:", trans);
          return false;
        }

        // 3️⃣ Verify transaction receipt on Hedera
        const txId = TransactionId.fromString(trans.transactionId);
        const client = Client.forTestnet();
        client.setLedgerId(LedgerId.TESTNET);

        const receipt = await new TransactionReceiptQuery()
          .setTransactionId(txId)
          .execute(client);

        console.log({ receipt });

        if (receipt.status.toString() !== "SUCCESS") {
          console.error(
            "Transaction not confirmed:",
            receipt.status.toString()
          );
          return false;
        }

        // 4️⃣ Notify backend
        await apiClient.post("/swap/deposit/settle", {
          investorAccountId: userAccountId,
          token: "USDC",
          amount,
          txId: trans.transactionId,
        });

        setSuccess(true);
        return true;
      } catch (err: any) {
        console.error("Swap error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sdk]
  );

  return { loading, success, swap };
}
