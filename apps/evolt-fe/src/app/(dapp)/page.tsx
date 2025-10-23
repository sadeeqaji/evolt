"use client";
import { Database, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import AssetTabs, {
  TabConfig,
} from "@evolt/components/features/dashboard/AssetManagementTabs";
import { BalanceCard } from "@evolt/components/features/dashboard/BalanceCard";
import StartInvestings from "@evolt/components/features/dashboard/StartInvesting";
import React from "react";

const Tabs: TabConfig[] = [
  {
    id: "assets",
    label: "My Assets",
    icon: Database,
    type: "link" as const,
    href: "/dashboard/assets?tab=assets",
  },
  {
    id: "deposit",
    label: "Deposit",
    icon: ArrowDownLeft,
    type: "link" as const,
    href: "/dashboard/assets?tab=deposit",
  },
  {
    id: "withdraw",
    label: "Withdraw",
    icon: ArrowUpRight,
    type: "link" as const,
    href: "/dashboard/assets?tab=withdraw",
  },
];

function Page() {
  return (
    <div className="mt-10 w-full max-w-2xl m-auto space-y-5">
      <BalanceCard initialBalance={0.0} currency="vUSD" />
      <AssetTabs tabs={Tabs} />
      <StartInvestings />
    </div>
  );
}

export default Page;
