import { useState } from "react";
import { Button } from "@evolt/components/ui/button";
import { Checkbox } from "@evolt/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@evolt/components/ui/drawer";
import { StakeInput } from "./StakeInput";
import { useHWBridge } from "@evolt/components/common/HWBridgeClientProvider";
import { useTokenAssociation } from "@evolt/hooks/useTokenAssociation";
import { AssociateTokenDialog } from "@evolt/components/common/AssociateTokenModal";
import { toast } from "sonner";
import { useJoinPool } from "@evolt/hooks/useJoinPool";
import { useGetVUSDBalance } from "@evolt/hooks/useGetVUSDBalance";

interface InvestmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId: string | undefined;
  minPurchase: number;
  maxPurchase: number;
  totalTarget: number;
  invoiceNumber: string;
  duration: number;
  apy: number;
}

export function InvestmentDrawer({
  open,
  onOpenChange,
  tokenId,
  minPurchase,
  maxPurchase,
  invoiceNumber,
  apy,
  duration,
}: InvestmentDrawerProps) {
  const [amount, setAmount] = useState(String(minPurchase));
  const [consent, setConsent] = useState(false);

  const { balance: availableBalance } = useGetVUSDBalance();
  const { accountId } = useHWBridge();
  const {
    isTokenAssociated,
    loading: tokenLoading,
    handleAssociate: originalHandleAssociate,
  } = useTokenAssociation(tokenId);
  const { loading: isJoining, joinPool } = useJoinPool();
  const [forceOpen, setForceOpen] = useState(false);

  const estimatedEarnings = (
    (parseFloat(amount || "0") * (apy / 100) * duration) /
    365
  ).toFixed(2);

  const handleAssociateAndOpen = async () => {
    try {
      await originalHandleAssociate();
      setForceOpen(true);
    } catch (error) {
      toast.error("Token association failed. Please try again.");
    }
  };

  // ✅ Float entry + validation + wallet check
  const handleAmountChange = (newAmount: string) => {
    if (newAmount === "" || newAmount === "." || newAmount === "0.") {
      setAmount(newAmount);
      return;
    }

    if (!/^\d*\.?\d*$/.test(newAmount)) return;

    const value = parseFloat(newAmount);
    if (isNaN(value)) return;

    const balance = availableBalance ?? 0;

    // Balance check
    if (value > balance) {
      setAmount(newAmount); // let user see what they typed
      return;
    }

    // Range checks
    if (value < minPurchase || value > maxPurchase) {
      setAmount(newAmount);
      return;
    }

    setAmount(newAmount);
  };

  // ✅ Round value on blur
  const handleAmountBlur = () => {
    if (!amount) return;
    const value = parseFloat(amount);
    if (!isNaN(value)) setAmount(value.toFixed(2));
  };

  const handleConfirm = async () => {
    const stakeAmount = parseFloat(amount);
    const balance = availableBalance ?? 0;

    if (stakeAmount < minPurchase || stakeAmount > maxPurchase) {
      toast.error(
        `Amount must be between ${minPurchase} and ${maxPurchase} VUSD.`
      );
      return;
    }

    if (stakeAmount > balance) {
      toast.error(
        `Insufficient balance. Available: ${balance.toFixed(2)} VUSD`
      );
      return;
    }

    if (!consent || !accountId || !tokenId || stakeAmount <= 0) {
      toast.error(
        "Please ensure all fields are valid and wallet is connected."
      );
      return;
    }

    try {
      await joinPool({
        poolId: tokenId,
        userAccountId: accountId,
        amount: stakeAmount,
        invoiceNumber: invoiceNumber,
      });

      onOpenChange(false);
      setAmount(String(minPurchase));
      setConsent(false);
    } catch (error) {
      console.error("Failed to join pool from drawer:", error);
    }
  };

  const isLoading = tokenLoading || isJoining;

  if (tokenId && accountId && open && isTokenAssociated === false) {
    return (
      <AssociateTokenDialog
        tokenId={tokenId}
        accountId={accountId}
        open={open}
        loading={tokenLoading}
        onOpenChange={onOpenChange}
        onAssociate={handleAssociateAndOpen}
      />
    );
  }

  const showContent =
    open && (isTokenAssociated === true || !accountId || !tokenId);

  const amountValue = parseFloat(amount || "0");
  const balance = availableBalance ?? 0;
  const hasInsufficientBalance = amountValue > balance;

  const amountIsValid =
    amountValue >= minPurchase &&
    amountValue <= maxPurchase &&
    !hasInsufficientBalance;

  const buttonText = hasInsufficientBalance
    ? "Insufficient Balance"
    : isJoining
      ? "Processing Transaction..."
      : "Confirm & Join Pool";

  return (
    <Drawer open={showContent || forceOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-drawer-bg border-drawer-border bg-black">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="pt-8">
            <div className="mx-auto mb-2 h-1 w-16 rounded-full bg-text-muted/40" />
            <DrawerTitle className="text-center text-2xl font-semibold text-text-primary">
              Join Investment Capital Pool
            </DrawerTitle>
          </DrawerHeader>

          {isLoading && tokenId ? (
            <div className="p-8 text-center text-text-muted">
              Loading wallet data...
            </div>
          ) : (
            <div className="px-6 pb-8 space-y-6">
              <StakeInput
                availableBalance={balance}
                currency="VUSD"
                tokenPair="USDT/VUSD"
                amount={amount}
                onAmountChange={handleAmountChange}
                onAmountBlur={handleAmountBlur}
                min={minPurchase}
                max={maxPurchase}
              />

              <p className="text-xs text-text-muted text-center">
                Minimum purchase:{" "}
                <span className="text-text-primary font-medium">
                  {minPurchase} VUSD
                </span>{" "}
                | Maximum purchase:{" "}
                <span className="text-text-primary font-medium">
                  {maxPurchase} VUSD
                </span>
              </p>

              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-text-secondary">
                    You are investing:
                  </span>
                  <span className="text-xl font-semibold text-text-primary">
                    {amount} VUSD
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-text-secondary">Into Pool for:</span>
                  <span className="text-xl font-semibold text-text-primary">
                    Invoice {invoiceNumber}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-text-secondary">Duration:</span>
                  <span className="text-xl font-semibold text-text-primary">
                    {duration} Days
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-text-secondary">
                    Estimated Earnings:
                  </span>
                  <span className="text-xl font-semibold text-text-primary">
                    {estimatedEarnings} VUSD
                  </span>
                  <span className="text-success font-medium">{apy}%</span>
                </div>
              </div>

              <div className="h-px bg-drawer-border" />

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  className="mt-1 border-drawer-border data-[state=checked]:bg-indigo data-[state=checked]:border-indigo"
                />
                <label
                  htmlFor="consent"
                  className="text-sm text-text-muted leading-relaxed cursor-pointer"
                >
                  I give my full consent for my VUSD to be utilized as the
                  staking currency for this investment pool.
                </label>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={
                  !consent ||
                  !amount ||
                  !amountIsValid ||
                  isJoining ||
                  tokenLoading
                }
                size="lg"
                loading={isJoining}
                className={`w-full rounded-2xl h-14 text-lg font-medium ${
                  hasInsufficientBalance
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : ""
                }`}
              >
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
