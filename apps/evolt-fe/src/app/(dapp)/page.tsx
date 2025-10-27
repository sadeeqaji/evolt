"use client";
import { Database, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import AssetTabs, {
  TabConfig,
} from "@evolt/components/features/dashboard/AssetManagementTabs";
import { BalanceCard } from "@evolt/components/features/dashboard/BalanceCard";
import StartInvestings from "@evolt/components/features/dashboard/StartInvesting";
import React, { useState, useEffect } from "react";
import { MarketplaceModal } from "@evolt/components/common/marketplace-modal";
import Cookies from "js-cookie";

const Tabs: TabConfig[] = [
  {
    id: "assets",
    label: "My Assets",
    icon: Database,
    type: "link" as const,
    href: "/assets?tab=assets",
  },
  {
    id: "deposit",
    label: "Deposit",
    icon: ArrowDownLeft,
    type: "link" as const,
    href: "/assets?tab=deposit",
  },
  {
    id: "withdraw",
    label: "Withdraw",
    icon: ArrowUpRight,
    type: "link" as const,
    href: "/assets?tab=withdraw",
  },
];

const MARKETPLACE_MODAL_COOKIE = "marketplaceModalShown";

function Page() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const modalShown = Cookies.get(MARKETPLACE_MODAL_COOKIE);
    if (!modalShown) {
      setShowModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);

    Cookies.set(MARKETPLACE_MODAL_COOKIE, "true", { expires: 1 });
  };

  return (
    <div className="mt-10 w-full max-w-2xl m-auto space-y-5">
      <BalanceCard initialBalance={0.0} currency="vUSD" />
      <AssetTabs tabs={Tabs} />
      <StartInvestings />

      {showModal && <MarketplaceModal onClose={handleCloseModal} />}
    </div>
  );
}

export default Page;
