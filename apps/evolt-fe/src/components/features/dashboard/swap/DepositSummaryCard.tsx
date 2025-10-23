import { useState } from "react";
import { useHWBridge } from "@evolt/components/common/HWBridgeClientProvider";
import { Button } from "@evolt/components/ui/button";
import { useTokenSwap } from "@evolt/hooks/useTokenSwap";
import { useRouter } from "next/navigation";

interface DepositSummaryCardProps {
  depositAmount: string;
  vusdAmount: string;
  onProceedToCheckout: () => void;
}

export const DepositSummaryCard = ({
  depositAmount,
  vusdAmount,
  onProceedToCheckout,
}: DepositSummaryCardProps) => {
  const hasAmount = depositAmount && parseFloat(depositAmount) > 0;
  const { accountId } = useHWBridge();
  const { swap } = useTokenSwap();
  const [loading, setLoading] = useState(false);
  const { push } = useRouter();
  const handleSwap = async () => {
    if (!accountId) {
      console.error("No Hedera account connected.");
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      console.error("Invalid deposit amount.");
      return;
    }

    setLoading(true);
    try {
      await swap({
        treasuryAccountId: "0.0.6968947",
        userAccountId: accountId,
        usdcTokenId: process.env.NEXT_PUBLIC_HEDERA_USDC_TOKEN_ID!,
        amount,
      });

      push("/dashboard");
    } catch (error) {
      console.error("Swap failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-swap-border rounded-3xl p-6 space-y-4">
      {hasAmount ? (
        <div className="bg-input-bg/50 border border-input-border rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="text-foreground">1 USDC = 1 VUSD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee (0.9%)</span>
            <span className="text-foreground">
              {(parseFloat(depositAmount) * 0.009).toFixed(2)} USDC
            </span>
          </div>
          <div className="border-t border-input-border pt-3 mt-2 flex justify-between text-base font-medium">
            <span className="text-foreground">Total VUSD</span>
            <span className="text-accent text-lg">{vusdAmount} VUSD</span>
          </div>
        </div>
      ) : (
        <div className="bg-input-bg/50 border border-input-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            Enter an amount to see transaction details
          </p>
        </div>
      )}

      {/* Swap & Proceed Button */}
      <Button
        onClick={handleSwap}
        className="w-full text-accent-foreground font-semibold py-6 rounded-2xl text-lg"
        disabled={!hasAmount || loading}
        loading={loading}
      >
        {loading ? "Processing..." : "Deposit "}
      </Button>

      {/* Info Message */}
      {hasAmount && (
        <p className="text-xs text-center text-yellow-400">
          {`This is a Testnet environment. USDC deposits are disabled — you'll receive
    1000 VUSD automatically for testing purposes.`}
        </p>
      )}
    </div>
  );
};
