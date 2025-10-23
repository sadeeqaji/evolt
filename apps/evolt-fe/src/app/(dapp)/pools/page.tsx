"use client";
import React, { useState } from "react";
import { BackButton } from "@evolt/components/common/BackButton";
import { InvestmentCard } from "@evolt/components/features/dashboard/InvestmentCard";
import CategoryCard from "@evolt/components/features/dashboard/CategoryCard";
import { PoolItem } from "@evolt/types/pool";
import { useAssetsByType, usePrefetchPoolDetails, AssetType } from "./api";
import { Search } from "lucide-react";
import { Input } from "@evolt/components/ui/input";
import { PoolStatus } from "@evolt/types/pool";
import { formatCurrency } from "@evolt/lib/formatCurrency";
import { StatusDisplay } from "@evolt/components/common/StatusDisplay";
import { cn } from "@evolt/lib/utils";

const categories: {
  title: string;
  image: string;
  colorClass: string;
  type: AssetType;
}[] = [
  {
    title: "All Assets",
    image: "/img/all.jpeg",
    colorClass: "bg-primary/70",
    type: "all",
  },
  {
    title: "Real Estate",
    image: "/img/real-estate.jpg",
    colorClass: "bg-[hsl(var(--real-estate))]",
    type: "real_estate",
  },
  {
    title: "Agriculture",
    image: "/img/agriculture.jpg",
    colorClass: "bg-[hsl(var(--agriculture))]",
    type: "agriculture",
  },
  {
    title: "Creator IP",
    image: "/img/art-collectibles.jpg",
    colorClass: "bg-[hsl(var(--art-collectibles))]",
    type: "creator_ip",
  },
  {
    title: "Receivables Factoring",
    image: "/img/private-credit.jpg",
    colorClass: "bg-[hsl(var(--private-credit))]",
    type: "receivable",
  },
  {
    title: "Automotive & Equipment",
    image: "/img/infrastructure.jpg",
    colorClass: "bg-[hsl(var(--infrastructure))]",
    type: "automotive_equipment",
  },
];

function getDaysLeft(expiryDate: string | null): number {
  if (!expiryDate) return 0;
  try {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

function toCardStatus(
  item: PoolItem,
  daysLeft: number,
  percentage: number
): "Open" | "Closed" | "Pending" {
  if (item?.status === "funding") return "Open";
  if (item?.status === "fully_funded" || item?.status === "tokenized")
    return "Closed";
  if (item?.status === "pending") return "Pending";

  if (percentage >= 100) return "Closed";
  if (daysLeft <= 0) return "Closed";
  return "Open";
}

export default function PoolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PoolStatus>("all");

  const [assetType, setAssetType] = useState<AssetType>("all");

  const { data, isLoading, isError, error } = useAssetsByType({
    type: assetType,
    page: 1,
    limit: 20,
  });
  const prefetch = usePrefetchPoolDetails();

  const items = data ?? [];

  return (
    <div className="mt-10 w-full max-w-6xl m-auto space-y-8">
      <div className="flex items-center">
        <BackButton />
      </div>

      <div className="mb-8 overflow-x-auto bg-black p-4 rounded-xl ">
        <div className="flex gap-4 min-w-max">
          {categories.map((category) => (
            <div
              key={category.title}
              className={cn(
                "w-48 flex-shrink-0 rounded-2xl transition-all duration-300",
                assetType === category.type
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-black"
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => setAssetType(category.type)}
            >
              <CategoryCard
                title={category.title}
                image={category.image}
                colorClass={category.colorClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search markets by name or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border h-12 text-base"
          />
        </div>
      </div>

      <div className="mt-12">
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-60 rounded-3xl bg-muted/50 animate-pulse border border-border"
              />
            ))}
          </div>
        )}

        {isError && (
          <StatusDisplay
            type="error"
            title="Failed to Load Pools"
            message={
              (error as Error)?.message ??
              "There was a problem fetching investment pools. Please try again later."
            }
          />
        )}

        {!isLoading && !isError && items.length === 0 && (
          <StatusDisplay
            type="empty"
            title="No Pools Found"
            message={`No investment pools found for the "${assetType}" category. Try selecting another category.`}
          />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const fundedAmount = it?.amount ?? 0;
              const totalTarget = it?.totalTarget ?? 0;
              const daysLeft = getDaysLeft(it?.expiryDate ?? null);

              const pct =
                totalTarget > 0
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round((fundedAmount / totalTarget) * 100)
                      )
                    )
                  : fundedAmount > 0
                  ? 100
                  : 0;

              const status = toCardStatus(it, daysLeft, pct);
              const leftText =
                status === "Open"
                  ? `${daysLeft} Days Left`
                  : pct >= 100
                  ? "Fully Subscribed"
                  : status === "Closed"
                  ? "Closed"
                  : "Status Unavailable";

              return (
                it?._id && (
                  <div key={it._id} onMouseEnter={() => prefetch(it._id)}>
                    <InvestmentCard
                      id={it._id}
                      name={it.tokenName ?? "Unnamed Pool"}
                      subtitle={
                        it.assetType ? `Asset Type: ${it.assetType}` : undefined
                      }
                      logo={undefined}
                      apy={`${((it.yieldRate ?? 0) * 100).toFixed(1)}%`}
                      totalTarget={formatCurrency(it.totalTarget ?? 0)}
                      fundingStatus={status}
                      fundingPercentage={pct}
                      progressLeftText={leftText}
                    />
                  </div>
                )
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
