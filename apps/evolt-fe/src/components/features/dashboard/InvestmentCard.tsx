"use client";
import { Info } from "lucide-react";
import { cn } from "@evolt/lib/utils";
import { Badge } from "@evolt/components/ui/badge";
import { Progress } from "@evolt/components/ui/progress";
import { useRouter } from "next/navigation";
interface InvestmentCardProps {
  id: string;
  name: string;
  subtitle?: string;
  logo?: string;
  apy: string;
  fundingStatus: "Open" | "Closed" | "Pending";
  fundingPercentage: number;
  progressLeftText?: string;
  totalTarget: string;
}

export const InvestmentCard = ({
  id,
  name,
  subtitle,
  logo,
  apy,

  fundingStatus,
  fundingPercentage,
  progressLeftText,
  totalTarget,
}: InvestmentCardProps) => {
  const isFullyFunded = fundingPercentage === 100;
  const { push } = useRouter();
  return (
    <div
      onClick={() => push(`/dashboard/pools/${id}`)}
      className={cn(
        "bg-black cursor-pointer rounded-3xl border border-border overflow-hidden p-6 transition-all duration-300 ease-smooth shadow-card hover:shadow-glow",
        "hover:bg-card-hover"
      )}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1">
          {logo && (
            <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center flex-shrink-0 border border-border">
              <img
                src={logo}
                alt={`${name} logo`}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-xl font-bold text-foreground truncate">
              {name}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0 pt-1">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5 justify-end">
            Exp. Yield <Info className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-bold text-foreground">{apy}</div>
        </div>
      </div>

      {/* Amount and Status Section */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-base font-semibold text-foreground">
          {totalTarget}
        </span>
        <Badge variant="default">Target</Badge>
      </div>

      {/* Progress Section */}
      <div className="space-y-2 flex justify-between items-center">
        <div className="flex justify-between items-center text-sm">
          {progressLeftText && (
            <span
              className={cn(
                "font-medium",
                fundingStatus === "Open"
                  ? "text-yellow-400"
                  : "text-muted-foreground"
              )}
            >
              {progressLeftText}
            </span>
          )}
        </div>
        <div className="w-[40%]">
          <div className="text-right text-muted-foreground flex justify-between text-xs">
            <span>{isFullyFunded ? "Fully Funded" : "Funding progress"}</span>
            <span className="font-semibold text-foreground">
              {fundingPercentage}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden ">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                fundingStatus === "Open" ? "bg-yellow-500" : "bg-green-600"
              )}
              style={{ width: `${fundingPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
