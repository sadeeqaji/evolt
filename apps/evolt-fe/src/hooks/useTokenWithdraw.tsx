import { useState, useCallback } from "react";
import {
  TransferTransaction,
  TokenId,
  TransactionId,
  AccountId,
} from "@hashgraph/sdk";
import { useHWBridge } from "@evolt/components/common/HWBridgeClientProvider";
import { transactionToBase64String } from "@evolt/lib/utils";
import apiClient from "@evolt/lib/apiClient";
import { toast } from "sonner";

const VUSD_TOKEN_ID = process.env.NEXT_PUBLIC_HEDERA_VUSD_TOKEN_ID!;
const USDC_TOKEN_ID = process.env.NEXT_PUBLIC_HEDERA_USDC_TOKEN_ID!;
const TREASURY_ACCOUNT_ID = "0.0.6968947";

interface WithdrawParams {
  userAccountId: string;
  amount: number;
}

interface UseTokenWithdrawResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  withdraw: (params: WithdrawParams) => Promise<void>;
}

/**
 * Handles a two-step token withdrawal:
 * 1. User sends VUSD -> Treasury
 * 2. Backend confirms and sends USDC -> User
 */
export function useTokenWithdraw(): UseTokenWithdrawResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { sdk } = useHWBridge();

  const withdraw = useCallback(
    async (params: WithdrawParams) => {
      const { userAccountId, amount } = params;
      if (!sdk) {
        toast.error("Wallet not connected");
        return;
      }
      const convertedAmount = amount * 1e6;

      try {
        setLoading(true);
        setError(null);
        setSuccess(false);
        toast.info(
          "Please approve the withdrawal transaction in your wallet..."
        );

        // Create the transaction to send VUSD from user to treasury
        const vusdTx = new TransferTransaction()
          .addTokenTransfer(
            TokenId.fromString(VUSD_TOKEN_ID),
            userAccountId,
            -convertedAmount
          )
          .addTokenTransfer(
            TokenId.fromString(VUSD_TOKEN_ID),
            TREASURY_ACCOUNT_ID,
            convertedAmount
          )
          // This part is the testnet "cheat" to automatically send USDC back
          // In production, a backend service would do this after verifying the VUSD transfer
          // .addTokenTransfer(
          //   TokenId.fromString(USDC_TOKEN_ID),
          //   TREASURY_ACCOUNT_ID,
          //   -amount // Assuming 1:1 swap rate
          // )



          .setTransactionId(
            TransactionId.generate(AccountId.fromString(userAccountId))
          );

        // Try to sign and execute. We'll proceed to backend call even if it fails (testnet logic)
        try {
          const trans: any = await sdk?.dAppConnector.signAndExecuteTransaction({
            signerAccountId: userAccountId,
            transactionList: transactionToBase64String(vusdTx),
          });
          const res = await apiClient.post("/swap/withdraw/settle", {
            investorAccountId: userAccountId,
            token: "USDC",
            amount,
            txId: trans?.transactionId,
          });
          console.log(res.data);
          toast.success("Withdrawal transaction sent!");
        } catch (hederaErr) {
          console.warn(
            "Hedera transaction failed, proceeding with testnet logic:",
            hederaErr
          );
          toast.warning("Testnet transaction failed, simulating success.");
        }

        // Call backend to log withdrawal and (in testnet) get automatic USDC


        toast.success("Withdrawal processed. You will receive USDC shortly.");
        setSuccess(true);
      } catch (err: any) {
        console.error("Withdraw error:", err);
        const errMsg = err.message || "Withdrawal failed";
        setError(errMsg);
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [sdk]
  );

  return { loading, error, success, withdraw };
}
