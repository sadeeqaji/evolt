"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@evolt/components/ui/dialog";
import { Button } from "@evolt/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2, Package, Wallet } from "lucide-react"; // Using Wallet for portfolio
import ReactConfetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

interface InvestmentSuccessModalProps {
  open: boolean;
  amount: number;
  assetId: string; // Or a more descriptive asset name if available
  onContinue: () => void;
  onViewPortfolio: () => void;
}

export const InvestmentSuccessModal: React.FC<InvestmentSuccessModalProps> = ({
  open,
  amount,
  assetId,
  onContinue,
  onViewPortfolio,
}) => {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger confetti after a short delay for the modal animation
      const timer = setTimeout(() => setShowConfetti(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [open]);

  const handlePortfolioClick = () => {
    onViewPortfolio();
    router.push("/assets?tab=assets");
  };

  const handleContinueClick = () => {
    onContinue();
    router.push("/pools");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      {/* Conditionally render confetti */}
      {showConfetti && open && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={8000}
        />
      )}
      <DialogContent
        showCloseButton={false}
        className="bg-black border-border max-w-md p-8 sm:p-10 text-center shadow-glow-purple"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-glow-pulse" />
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-2xl border-4 border-primary/30">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Investment Successful!
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              You have successfully invested
              <span className="font-bold text-primary-foreground mx-1.5">
                {amount.toFixed(2)} VUSD
              </span>
              into asset{" "}
              <span className="font-bold text-primary-foreground">
                {assetId}
              </span>
              .
            </p>
          </div>

          <div className="w-full flex flex-col gap-4 pt-4">
            <Button
              onClick={handleContinueClick}
              size="lg"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <Package className="mr-2 h-5 w-5" />
              Continue Investing
            </Button>
            <Button
              onClick={handlePortfolioClick}
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg rounded-xl"
            >
              <Wallet className="mr-2 h-5 w-5" />
              See My Portfolio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
