import { useState, useCallback } from "react";
import { TransferTransaction, TokenId, TransactionId } from "@hashgraph/sdk";
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
  error: string | null;
  success: boolean;
  swap: (params: SwapParams) => Promise<void>;
}

/**
 * Handles a two-step token swap:
 * 1. User sends USDC → Treasury
 * 2. Backend confirms and sends VSUD → User
 */
export function useTokenSwap(): UseTokenSwapResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { sdk } = useHWBridge();
  const swap = useCallback(async (params: SwapParams) => {
    const { usdcTokenId, userAccountId, treasuryAccountId, amount } = params;
    const convertedAmount = amount * 1e6;
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

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
        // .addTokenTransfer(
        //   TokenId.fromString("0.0.7029847"),
        //   userAccountId,
        //   amount
        // )
        .setTransactionId(TransactionId.generate(userAccountId));

      try {
        const trans: any = await sdk?.dAppConnector.signAndExecuteTransaction({
          signerAccountId: userAccountId,
          transactionList: transactionToBase64String(usdcTx),
        });

        await apiClient.post("/swap/deposit/settle", {
          investorAccountId: userAccountId,
          token: "USDC",
          amount,
          txId: trans?.transactionId,
        });

      } catch (hederaErr) {
        console.warn(
          "Hedera transaction failed, proceeding anyway:",
          hederaErr
        );
      }



      setSuccess(true);
    } catch (err: any) {
      console.error("Swap error:", err);
      setError(err.message || "Swap failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, swap };
}
