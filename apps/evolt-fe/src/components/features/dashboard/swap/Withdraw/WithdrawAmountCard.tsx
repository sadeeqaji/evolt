import { ArrowDown } from "lucide-react";

interface WithdrawAmountCardProps {
  withdrawAmount: string;
  usdcAmount: string;
  onWithdrawAmountChange: (value: string) => void;
}

export const WithdrawAmountCard = ({
  withdrawAmount,
  usdcAmount,
  onWithdrawAmountChange,
}: WithdrawAmountCardProps) => {
  return (
    <div className="bg-black border border-swap-border rounded-3xl p-4 sm:p-6 relative">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Withdraw Amount Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Withdraw Amount
            </span>
          </div>

          <div className="bg-input-bg border border-input-border rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-[100px] sm:min-w-[120px]">
                <img
                  src="/vusd.png" // VUSD Logo
                  alt="VUSD"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                    VUSD
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    Volt USD
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => onWithdrawAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-right text-lg sm:text-2xl font-medium text-foreground outline-none placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-black  p-2">
            <ArrowDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
          </div>
        </div>
        <div className="flex justify-center -my-2 sm:-my-3 md:hidden">
          <div className="bg-black border border-input-border rounded-full p-2">
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* You Will Receive Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              You Will Receive
            </span>
          </div>

          <div className="bg-input-bg border border-input-border rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-[100px] sm:min-w-[120px]">
                <img
                  src={"/usdc.png"} // USDC Logo
                  alt="USDC"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                    USDC
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    USD Coin
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-right text-lg sm:text-2xl font-medium text-foreground truncate">
                  {usdcAmount || "0.00"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical divider for desktop */}
      <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px bg-input-border -translate-x-1/2" />
    </div>
  );
};
