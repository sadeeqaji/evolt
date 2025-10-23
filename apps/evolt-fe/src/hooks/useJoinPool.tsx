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

interface JoinPoolParams {
  poolId: string;
  amount: number;
  userAccountId: string;
  invoiceNumber: string;
}

interface UseJoinPoolResult {
  loading: boolean;
  error: string | null;
  joinPool: (params: JoinPoolParams) => Promise<void>;
}

const VUSD_TOKEN_ID = "0.0.7029847";
const ESCROW_ACCOUNT_ID = "0x803A0eF8ef6732d281A90901a3C9B5fb21ee84C1";
const VUSD_DECIMALS = 6;

export function useJoinPool(): UseJoinPoolResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sdk } = useHWBridge();

  const joinPool = useCallback(
    async (params: JoinPoolParams) => {
      const { poolId, userAccountId, amount, invoiceNumber } = params;

      const vusdUnits = Math.round(Number(amount) * 10 ** VUSD_DECIMALS);

      if (!Number.isFinite(vusdUnits) || vusdUnits <= 0) {
        const errorMessage = "Invalid VUSD amount for staking.";
        toast.error(errorMessage);
        setError(errorMessage);
        return;
      }

      if (!sdk) {
        const errorMessage = "Wallet SDK not initialized.";
        toast.error(errorMessage);
        setError(errorMessage);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const transferTx = new TransferTransaction()
          .addTokenTransfer(
            TokenId.fromString(VUSD_TOKEN_ID),
            userAccountId,
            -vusdUnits
          )
          .addTokenTransfer(
            TokenId.fromString(VUSD_TOKEN_ID),
            ESCROW_ACCOUNT_ID!,
            vusdUnits
          )
          .setTransactionMemo(`Deposit to Escrow for Invoice ${invoiceNumber}`)
          .setTransactionId(
            TransactionId.generate(AccountId.fromString(userAccountId))
          );

        toast.info("Awaiting wallet confirmation to send VUSD to Escrow...");

        const payB64 = transactionToBase64String(transferTx);

        const hederaResult: any =
          await sdk.dAppConnector.signAndExecuteTransaction({
            signerAccountId: userAccountId,
            transactionList: payB64,
          });

        toast.success("VUSD sent to Escrow ✅", {
          description: `${amount} VUSD staked for Invoice ${invoiceNumber}`,
        });

        toast.info("Recording investment and receiving invoice token...");

        const investmentResponse = await apiClient.post("/investment", {
          invoiceId: invoiceNumber,
          txId: hederaResult.transactionId,
        });

        console.log("Investment recorded:", investmentResponse.data);
        toast.success(
          investmentResponse.data?.message ||
            "Successfully joined capital pool!"
        );
      } catch (err: any) {
        console.error("Join Pool failed:", err);

        let errorMessage = "Transaction failed. Please try again.";

        if (err?.message?.includes("User rejected")) {
          errorMessage = "Transaction cancelled by user.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [sdk]
  );

  return { loading, error, joinPool };
}
