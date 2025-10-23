"use client";
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@evolt/components/ui/tabs";
import { PoolCard } from "./PoolCard";
import { usePortfolio } from "@evolt/hooks/usePortfoliio";
import { formatCurrency } from "@evolt/lib/formatCurrency";
import StartInvestings from "./StartInvesting";
import { PortfolioLoading } from "./PortfolioLoading";
import NoInvestmentDue from "./NoInvestmentDue";
export function AssetContent() {
  const { portfolios, isLoading } = usePortfolio();

  return (
    <div>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Stake</TabsTrigger>
          <TabsTrigger value="completed">Completed Stake</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          {portfolios?.pending.map((portfolio) => (
            <PoolCard
              key={portfolio.id}
              name={portfolio.invoiceNumber}
              totalValueLocked={formatCurrency(portfolio.vusdAmount)}
              createdAt={portfolio.createdAt}
              totalEarnings={formatCurrency(portfolio.expectedYield)}
              maturedAt={portfolio.maturedAt}
              percentageChange={portfolio.yieldRate}
              isActive={true}
            />
          ))}

          {!portfolios?.pending.length && !isLoading && <StartInvestings />}
          {isLoading && <PortfolioLoading />}
        </TabsContent>
        <TabsContent value="completed">
          {portfolios?.completed.map((portfolio) => (
            <PoolCard
              key={portfolio.id}
              name={portfolio.invoiceNumber}
              totalValueLocked={formatCurrency(portfolio.vusdAmount)}
              createdAt={portfolio.createdAt}
              totalEarnings={formatCurrency(portfolio.expectedYield)}
              maturedAt={portfolio.maturedAt}
              percentageChange={portfolio.yieldRate}
              isActive={false}
            />
          ))}

          {!portfolios?.completed.length && !isLoading && <NoInvestmentDue />}

          {isLoading && <PortfolioLoading />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AssetContent;
