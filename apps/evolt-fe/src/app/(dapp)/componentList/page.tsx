"use client";
import AssetTabs from "@evolt/components/features/dashboard/AssetManagementTabs";
import { BalanceCard } from "@evolt/components/features/dashboard/BalanceCard";
import { InvestmentCard } from "@evolt/components/features/dashboard/InvestmentCard";
import { InvestmentDrawer } from "@evolt/components/features/dashboard/InvestmentDrawer";
import { InvoiceCard } from "@evolt/components/features/dashboard/InvoiceDetailCard";
import { PoolCard } from "@evolt/components/features/dashboard/PoolCard";
import { WithDrawCard } from "@evolt/components/features/dashboard/StackingCard";
import StartInvestings from "@evolt/components/features/dashboard/StartInvesting";
import { Button } from "@evolt/components/ui/button";
import React, { useState } from "react";

function Page() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <div className="space-y-8">
      <BalanceCard balance={12345.67} currency="USDC" />
      {/* <AssetTabs /> */}

      {/* Investment Cards Example from Screenshots */}
      <InvestmentCard
        id="1"
        name="TotalEnergies"
        subtitle="Chika Logistics Ltd."
        logo="https://via.placeholder.com/80/FFFFFF/000000?text=TE"
        apy="18.5% APY"
        minAmount="700 USDT"
        maxAmount="1,200 USDT"
        fundingStatus="Open"
        fundingPercentage={73}
        progressLeftText="5 Days Left"
      />

      <InvestmentCard
        id="2"
        name="Honeywell"
        subtitle="Mind Colony LTD"
        logo="https://via.placeholder.com/80/FFFFFF/000000?text=H"
        apy="18.5% APY"
        minAmount="700 USDT"
        maxAmount="1,200 USDT"
        fundingStatus="Closed"
        fundingPercentage={100}
        progressLeftText="No More Stakers"
      />

      {/* Old Pool Cards */}
      <PoolCard
        name="Dangote Rice Mill"
        totalValueLocked="245.00 USDT"
        totalValueLockedSmall="0.0000000134S"
        totalEarnings="3.23 USDT"
        totalEarningsSmall="0.0000002345"
        percentageChange="0.028%"
        isActive={true}
      />

      <PoolCard
        name="Dangote Rice Mill"
        totalValueLocked="245.00 USDT"
        totalValueLockedSmall="0.0000000134S"
        totalEarnings="3.23 USDT"
        totalEarningsSmall="0.0000002345"
        isActive={false}
      />

      <WithDrawCard
        name="Dangote Rice Mill"
        totalValueLocked="45.00 USDT"
        totalValueLockedSmall="0.00000001345"
        totalEarnings="38.13 USDT"
        totalEarningsSmall="0.0000002345"
      />

      <WithDrawCard
        name="Green Energy Fund"
        totalValueLocked="2,250.00 USDT"
        totalValueLockedSmall="0.00000003892"
        totalEarnings="176.82 USDT"
        totalEarningsSmall="0.00000009123"
      />

      <InvoiceCard
        invoiceNumber="#12345"
        fromCompany="Chika Logistics"
        toCompany="TotalEnergies"
        logoUrl="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop"
        smeVendorDescription="Chika's company, founded in 2020, specializes in innovative tech solutions that empower small businesses. With a focus on user-friendly software and exceptional customer service, Chika's team is dedicated to helping clients streamline their operations and achieve their goals. Based in San Francisco, the company has quickly gained a reputation for its cutting-edge products and commitment to excellence."
        corporatePayerDescription="Chika's company, founded in 2020, specializes in innovative tech solutions that empower small businesses. With a focus on user-friendly software and exceptional customer service, Chika's team is dedicated to helping clients streamline their operations and achieve their goals. Based in San Francisco, the company has quickly gained a reputation for its cutting-edge products and commitment to excellence."
        numberOfStakers={50}
        expectedAPY={18.2}
        amountFunded={0.0}
        currency="USDT"
        duration={90}
        durationUnit="days"
        verifiedBy="Mr. Adebayo"
        verifierTitle="Finance Manager, TotalEnergies"
        verificationDate="Oct 6, 2025, 10:45 AM"
        blockchainExplorerUrl="https://hashscan.io/mainnet"
      />

      <Button
        onClick={() => setIsDrawerOpen(true)}
        size="lg"
        className="shadow-[1px_6px_14px_0_rgba(85,92,228,0.21),3px_24px_25px_0_rgba(85,92,228,0.18)] w-full rounded-full transition-all duration-200 hover:scale-[1.02]"
      >
        Join Capital Pool
      </Button>

      <InvestmentDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <StartInvestings />
    </div>
  );
}

export default Page;
