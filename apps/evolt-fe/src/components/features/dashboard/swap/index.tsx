import { useState, useEffect } from "react";
import { Button } from "@evolt/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@evolt/components/ui/dialog";
import { toast } from "sonner";
import { DepositAmountCard } from "./DepositAmountCard";
import { DepositSummaryCard } from "./DepositSummaryCard";

export const TokenSwap = () => {
  const [depositAmount, setDepositAmount] = useState("");
  const [vusdAmount, setVusdAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);

  const [timeLeft, setTimeLeft] = useState(600);

  const handleDepositAmountChange = (value: string) => {
    setDepositAmount(value);

    if (value && !isNaN(parseFloat(value))) {
      setVusdAmount((parseFloat(value) * 0.991).toFixed(2));
    } else {
      setVusdAmount("");
    }
  };

  const handleProceedToCheckout = () => {
    setShowDepositModal(true);
    setTimeLeft(600);
  };

  useEffect(() => {
    if (showDepositModal && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showDepositModal, timeLeft]);

  return (
    <div className="w-full space-y-6">
      <div className="relative">
        <DepositAmountCard
          depositAmount={depositAmount}
          vusdAmount={vusdAmount}
          onDepositAmountChange={handleDepositAmountChange}
        />
      </div>

      <DepositSummaryCard
        depositAmount={depositAmount}
        vusdAmount={vusdAmount}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Deposit USDC</DialogTitle>
            <DialogDescription>
              Send USDC to the address below to receive your VUSD
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Time Remaining
              </p>
              <p className="text-2xl font-bold text-destructive">
                {formatTime(timeLeft)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deposit Address</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-input-bg border border-input-border rounded-lg p-3 font-mono text-sm break-all">
                  {depositAddress}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyAddress}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-input-bg/50 border border-input-border rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit Amount</span>
                <span className="font-semibold">{depositAmount} USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{`You'll Receive`}</span>
                <span className="font-semibold text-accent">
                  {vusdAmount} VUSD
                </span>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
              <p className="text-sm text-center">
                <span className="font-semibold">⚠️ Testnet Mode:</span> Clicking
                {`"I Have Deposited" will automatically credit 1000 VUSD to your
                account for testing purposes.`}
              </p>
            </div>

            <Button
              onClick={handleConfirmDeposit}
              className="w-full   font-semibold py-6 text-lg"
            >
              I Have Deposited
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};
