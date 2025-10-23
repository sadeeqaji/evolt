import { useQuery } from "@tanstack/react-query";
import { useHWBridge } from "@evolt/components/common/HWBridgeClientProvider";
import apiClient from "@evolt/lib/apiClient";

export interface PortfolioItem {
  id: string;
  poolName: string;
  tokenId: string;
  vusdAmount: number;
  yieldRate: number;
  dailyPct: number;
  expectedYield: number;
  earningsToDate: number;
  earningsPctToDate: number;
  createdAt: string;
  status: "active" | "matured" | "pending" | string;
  invoiceId: string;
  invoiceNumber: string;
  logoUrl: string | null;
  iTokenAmount: number;
  maturedAt: string;
}

export interface PortfolioTotals {
  tvlPending: number;
  earningsToDatePending: number;
}

export interface PortfolioResponse {
  pending: PortfolioItem[];
  completed: PortfolioItem[];
  totals: PortfolioTotals;
}

interface UsePortfolioResult {
  portfolios: PortfolioResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePortfolio(): UsePortfolioResult {
  const { accountId } = useHWBridge();

  const { data, isLoading, error, refetch } =
    useQuery<PortfolioResponse | null>({
      queryKey: ["portfolio", accountId],
      queryFn: async () => {
        if (!accountId) return null;

        const response = await apiClient.get(`/investor/portfolio`);

        const result = response?.data?.data;

        if (!result) return null;

        return {
          pending: result.pending ?? [],
          completed: result.completed ?? [],
          totals: result.totals ?? { tvlPending: 0, earningsToDatePending: 0 },
        };
      },
      enabled: !!accountId,
    });

  return {
    portfolios: data ?? null,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
