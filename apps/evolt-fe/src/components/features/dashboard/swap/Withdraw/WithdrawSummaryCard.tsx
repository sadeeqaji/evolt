import { useState } from "react";
import { useHWBridge } from "@evolt/components/common/HWBridgeClientProvider";
import { Button } from "@evolt/components/ui/button";
import { useTokenWithdraw } from "@evolt/hooks/useTokenWithdraw"; // New Hook
import { useRouter } from "next/navigation";
import { useGetVUSDBalance } from "@evolt/hooks/useGetVUSDBalance"; // To check balance
import { toast } from "sonner";

interface WithdrawSummaryCardProps {
  withdrawAmount: string;
  usdcAmount: string;
}

export const WithdrawSummaryCard = ({
  withdrawAmount,
  usdcAmount,
}: WithdrawSummaryCardProps) => {
  const amountToWithdraw = parseFloat(withdrawAmount);
  const hasAmount = amountToWithdraw > 0;
  const { accountId } = useHWBridge();
  const { balance: vusdBalance } = useGetVUSDBalance();
  const { withdraw, loading } = useTokenWithdraw(); // New Hook
  const { push } = useRouter();

  const handleWithdraw = async () => {
    if (!accountId) {
      toast.error("No Hedera account connected.");
      return;
    }
    if (!hasAmount) {
      toast.error("Invalid withdrawal amount.");
      return;
    }
    if (vusdBalance === null || amountToWithdraw > vusdBalance) {
      toast.error("Insufficient VUSD balance.");
      return;
    }

    try {
      await withdraw({
        userAccountId: accountId,
        amount: amountToWithdraw,
      });
      // Optionally navigate or refresh balance after success
      push("/dashboard");
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  return (
    <div className="bg-black border border-swap-border rounded-3xl p-6 space-y-4">
      {hasAmount ? (
        <div className="bg-input-bg/50 border border-input-border rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="text-foreground">1 VUSD ≈ 1 USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span className="text-foreground">~ 0.01 HBAR</span>
          </div>
          <div className="border-t border-input-border pt-3 mt-2 flex justify-between text-base font-medium">
            <span className="text-foreground">You Receive</span>
            <span className="text-accent text-lg">{usdcAmount} USDC</span>
          </div>
        </div>
      ) : (
        <div className="bg-input-bg/50 border border-input-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            Enter an amount to see transaction details
          </p>
        </div>
      )}

      {/* Withdraw Button */}
      <Button
        onClick={handleWithdraw}
        className="w-full text-accent-foreground font-semibold py-6 rounded-2xl text-lg"
        disabled={!hasAmount || loading}
        loading={loading}
      >
        {loading ? "Processing..." : "Withdraw VUSD"}
      </Button>

      {/* Info Message */}
      {hasAmount && (
        <p className="text-xs text-center text-yellow-400">
          {`This is a Testnet environment. You'll receive test USDC automatically.`}
        </p>
      )}
    </div>
  );
};
