import { Info, ArrowUpDown } from "lucide-react";
import { cn } from "@evolt/lib/utils";
import { Button } from "@evolt/components/ui/button";

interface PoolCardProps {
  name: string;
  totalValueLocked: string;
  totalValueLockedSmall: string;
  totalEarnings: string;
  totalEarningsSmall: string;
  percentageChange?: string;
  isActive?: boolean;
}

export const WithDrawCard = ({
  name,
  totalValueLocked,
  totalValueLockedSmall,
  totalEarnings,
  totalEarningsSmall,
  percentageChange,
  isActive = true,
}: PoolCardProps) => {
  return (
    <div className="w-full max-w-2xl rounded-3xl bg-black p-4 sm:px-6 shadow-lg border border-gray-800 transition-all duration-300 hover:shadow-xl hover:border-gray-700">
      <h2
        className={cn(
          "text-xl sm:text-2xl font-medium transition-colors duration-300",
          isActive ? "text-white" : "text-gray-500"
        )}
      >
        {name}
      </h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mt-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs sm:text-sm text-gray-400">
              Total Value Locked
            </span>
            <Info className="w-4 h-4 text-gray-500" />
          </div>
          <div
            className={cn(
              "text-lg sm:text-xl font-medium mb-1",
              isActive ? "text-white" : "text-gray-500"
            )}
          >
            = {totalValueLocked}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            {totalValueLockedSmall}
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-2 my-2">
          <div className="h-10 w-px bg-gray-700" />
          <ArrowUpDown className="w-5 h-5 text-gray-500" />
          <div className="h-10 w-px bg-gray-700" />
        </div>

        <div className="w-full h-px bg-gray-700 my-2 md:hidden" />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs sm:text-sm text-gray-400">
              Total Earnings
            </span>
            <Info className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex items-center gap-3 mb-1">
            <span
              className={cn(
                "text-lg sm:text-xl font-medium",
                isActive ? "text-white" : "text-gray-500"
              )}
            >
              = {totalEarnings}
            </span>
            {isActive && percentageChange && (
              <span className="text-sm font-medium flex items-center text-green-400">
                ▲{percentageChange}
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            {totalEarningsSmall}
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button className="w-full h-14 text-base font-semibold rounded-full bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-300 mt-6">
        Withdraw Assets
      </button>
    </div>
  );
};
