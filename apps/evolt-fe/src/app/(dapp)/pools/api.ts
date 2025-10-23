"use client";

import {
  useQuery,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "@evolt/lib/apiClient";
import type { PoolItem, PoolStatus } from "@evolt/types/pool";

export const poolsKeys = {
  all: ["pools"] as const,
  list: (params: {
    page: number;
    limit: number;
    status: PoolStatus;
    search?: string;
  }) => [...poolsKeys.all, "list", params] as const,
  detail: (poolId: string) => [...poolsKeys.all, "detail", poolId] as const,
};

export const assetsKeys = {
  all: ["assets"] as const,
  byType: (params: { type: string; page: number; limit: number }) =>
    [...assetsKeys.all, "byType", params] as const,
};

export function usePools(params: {
  page?: number;
  limit?: number;
  status?: PoolStatus;
  search?: string;
}) {
  const { page = 1, limit = 20, status = "all", search } = params || {};

  return useQuery<PoolItem[]>({
    queryKey: poolsKeys.list({
      page,
      limit,
      status,
      ...(search ? { search } : {}),
    }),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<{
        success: boolean;
        message: string;
        data: PoolItem[];
      }>("/pool/", {
        params: { page, limit, status, ...(search ? { search } : {}) },
        signal,
      });
      if (!data?.success) throw new Error("Failed to fetch pools");
      return data.data;
    },
    staleTime: 1000 * 60 * 1,
  });
}

export function usePoolDetails(poolId?: string) {
  return useQuery<PoolItem>({
    queryKey: poolsKeys.detail(poolId ?? ""),
    enabled: !!poolId,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(`/pool/${poolId}`, { signal });
      if (!data?.success)
        throw new Error(data?.error || "Failed to fetch pool details");
      return data.data as PoolItem;
    },
    staleTime: 1000 * 60 * 1,
  });
}

export function usePoolDetailsSuspense(poolId: string) {
  return useSuspenseQuery<PoolItem>({
    queryKey: poolsKeys.detail(poolId),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(`/pool/${poolId}`, { signal });
      if (!data?.success)
        throw new Error(data?.error || "Failed to fetch pool details");
      return data.data as PoolItem;
    },
    staleTime: 1000 * 60 * 1,
  });
}

export function usePrefetchPoolDetails() {
  const qc = useQueryClient();
  return (poolId: string) =>
    qc.prefetchQuery({
      queryKey: poolsKeys.detail(poolId),
      queryFn: async () => {
        const { data } = await apiClient.get(`/pool/${poolId}`);
        if (!data?.success)
          throw new Error(data?.error || "Failed to fetch pool details");
        return data.data as PoolItem;
      },
      staleTime: 1000 * 60 * 1,
    });
}

export type AssetType =
  | "invoice"
  | "real_estate"
  | "automotive_equipment"
  | "agriculture"
  | "creator_ip"
  | "receivable"
  | "all";

export function useAssetsByType(params: {
  type: AssetType;
  page?: number;
  limit?: number;
}) {
  const { type, page = 1, limit = 20 } = params;

  return useQuery<PoolItem[]>({
    queryKey: assetsKeys.byType({ type, page, limit }),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<{
        success: boolean;
        message: string;
        data: PoolItem[];
      }>(`/asset/type/${type}`, {
        params: { page, limit },
        signal,
      });
      if (!data?.success)
        throw new Error(`Failed to fetch assets of type ${type}`);
      return data.data;
    },
    staleTime: 1000 * 60 * 1,
  });
}
