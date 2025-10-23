"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { cn } from "@evolt/lib/utils";
import { useGetVUSDBalance } from "@evolt/hooks/useGetVUSDBalance";
import { Button } from "@evolt/components/ui/button";

interface BalanceCardProps {
  initialBalance?: number;
  currency?: string;
  className?: string;
}

export function BalanceCard({
  initialBalance = 0,
  currency = "VUSD",
  className,
}: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { balance, isLoading, isError, refetchBalance } = useGetVUSDBalance();

  const displayBalance = typeof balance === "number" ? balance : initialBalance;

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayBalance);

  const handleToggleVisibility = () => setIsVisible((v) => !v);

  return (
    <div
      className={cn(
        "relative bg-black text-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl w-full overflow-hidden border border-white/10 shadow-2xl",
        className
      )}
    >
      {/* Pulsing background circles */}
      <div className="absolute -top-8 -right-8 sm:-top-12 sm:-right-12 md:-top-16 md:-right-16 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-[60%] h-[60%] border-2 sm:border-3 border-primary/40 rounded-full animate-pulse-slow" />
        <div className="absolute top-0 right-0 w-full h-full border-2 sm:border-3 border-primary/25 rounded-full animate-pulse-slow-delayed" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xs sm:text-sm md:text-base text-gray-400 font-medium tracking-wide">
              Total Assets
            </span>
            <button
              onClick={handleToggleVisibility}
              className="focus:outline-none hover:bg-white/5 rounded-lg p-1.5 sm:p-2 transition-all duration-200 hover:scale-105"
              aria-label={isVisible ? "Hide balance" : "Show balance"}
            >
              {isVisible ? (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              ) : (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Subtle refresh button */}
          <Button
            onClick={refetchBalance}
            variant="ghost"
            size="icon"
            disabled={isLoading}
            className="hover:bg-white/10 transition-all"
            aria-label="Refresh balance"
          >
            <RotateCcw
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform",
                isLoading && "animate-spin"
              )}
            />
          </Button>
        </div>

        {/* Balance display */}
        <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-none">
            {isVisible ? formattedBalance : "••••••"}
          </span>

          {!isLoading && !isError && (
            <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-400 leading-none">
              {currency}
            </span>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.7;
          }
        }

        @keyframes pulse-slow-delayed {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.04);
            opacity: 0.8;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow-delayed {
          animation: pulse-slow-delayed 4s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
