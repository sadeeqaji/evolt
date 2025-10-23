"use client";

import React from "react";
import { BackButton } from "@evolt/components/common/BackButton";
import { Button } from "@evolt/components/ui/button";
import { InvoiceCard } from "@evolt/components/features/dashboard/InvoiceDetailCard";
import { InvestmentDrawer } from "@evolt/components/features/dashboard/InvestmentDrawer";
import { usePoolDetails } from "@evolt/app/(dapp)/dashboard/pools/api";
import { StatusDisplay } from "@evolt/components/common/StatusDisplay";

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function hashscanTxUrl(
  hcsTxId?: string | null,
  network = process.env.NEXT_PUBLIC_HASHSCAN_NETWORK ?? "testnet"
) {
  return hcsTxId
    ? `https://hashscan.io/${network}/transaction/${encodeURIComponent(
        hcsTxId
      )}`
    : "#";
}

interface PoolDetailClientProps {
  poolId: string;
}

export default function PoolDetailClient({ poolId }: PoolDetailClientProps) {
  const { data, isLoading, isError, error } = usePoolDetails(poolId);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  if (isError) {
    return (
      <div className="mt-10 w-full max-w-2xl m-auto space-y-5">
        <BackButton />
        <StatusDisplay
          type="error"
          title="Failed to Load Pool Details"
          message={
            (error as Error)?.message ??
            "There was a problem fetching the pool details. Please ensure the Pool ID is correct or try again later."
          }
        />
      </div>
    );
  }

  if (!data) {
    if (!isLoading) {
      return (
        <div className="mt-10 w-full max-w-2xl m-auto space-y-5">
          <BackButton />
          <StatusDisplay
            type="warning"
            title="Pool Not Found"
            message={`Could not find details for Pool ID: ${poolId}. Please check the ID and try again.`}
          />
        </div>
      );
    }

    return null;
  }

  return (
    <div className="mt-10 w-full max-w-2xl m-auto space-y-5">
      <div>
        <BackButton />
      </div>

      <InvoiceCard
        invoiceNumber={`#${data.invoiceNumber ?? poolId}`}
        logoUrl={data.corporateLogo ?? undefined}
        smeVendorDescription={
          data.businessDescription || "No description available."
        }
        corporatePayerDescription={
          data.corporateDescription || "No description available."
        }
        numberOfStakers={data.totalInvestors ?? data.stakerCountOnChain ?? 0}
        expectedAPY={(data.yieldRate ?? 0) * 100}
        amountFunded={data.amount ?? 0}
        currency={data.currency ?? "USDC"}
        duration={data.durationInDays ?? 0}
        durationUnit="days"
        verifiedBy={data.verifier ?? "Not specified"}
        verifierTitle="Finance Manager"
        verificationDate={formatDateTime(data.verifiedAt)}
        blockchainExplorerUrl={hashscanTxUrl(data.hcsTxId)!}
      />

      <Button
        onClick={() => setDrawerOpen(true)}
        size="lg"
        className="shadow-[1px_6px_14px_0_rgba(85,92,228,0.21),3px_24px_25px_0_rgba(85,92,228,0.18)] w-full rounded-full transition-all duration-200 hover:scale-[1.02]"
        disabled={data.status !== "funding"}
      >
        {data.status === "funding"
          ? "Join Capital Pool"
          : "Pool Not Open for Investment"}
      </Button>

      <InvestmentDrawer
        open={drawerOpen}
        duration={data.durationInDays ?? 0}
        onOpenChange={setDrawerOpen}
        invoiceNumber={data.invoiceNumber ?? data._id}
        apy={(data.yieldRate ?? 0) * 100}
        tokenId={data.tokenId ?? undefined}
        minPurchase={data.minInvestment ?? 10}
        maxPurchase={data.maxInvestment ?? data.totalTarget ?? 1000}
        totalTarget={data.totalTarget ?? 0}
      />
    </div>
  );
}
