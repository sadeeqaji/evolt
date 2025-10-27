"use client";

import * as React from "react";
import { DataTable } from "@evolt/components/common/data-table";
import { columns } from "./assets/columns";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@evolt/lib/adminApiClient";
import { AssetDoc } from "@evolt/types/pool";
import { Button } from "@evolt/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@evolt/components/ui/tabs";

interface AssetsApiResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    limit: number;
    total: number;
    items: AssetDoc[];
  };
}

export default function AdminAssetsPage() {
  const [statusFilter, setStatusFilter] = React.useState<
    "pending" | "verified"
  >("pending");
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const fetchAssets = async (
    verifiedStatus: boolean,
    currentPage: number
  ): Promise<AssetsApiResponse> => {
    const token = sessionStorage.getItem("adminAccessToken");
    const { data } = await apiClient.get<AssetsApiResponse>(`/asset/status`, {
      params: { verified: verifiedStatus, page: currentPage, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  };

  const { data, isLoading, isError, error, refetch } =
    useQuery<AssetsApiResponse>({
      queryKey: ["adminAssets", statusFilter, page],
      queryFn: () => fetchAssets(statusFilter === "verified", page),
    });

  const handleTabChange = (value: string) => {
    setStatusFilter(value as "pending" | "verified");
    setPage(1);
    refetch();
  };

  const handleVerifySuccess = () => {
    refetch();
  };

  const tableColumns = React.useMemo(
    () => columns(handleVerifySuccess),
    [handleVerifySuccess]
  );

  console.log({ tableColumns });

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Manage Assets</h1>

      <Tabs
        value={statusFilter}
        onValueChange={handleTabChange}
        className="bg-black"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="verified">Verified Assets</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="p-3">
          <DataTable
            columns={tableColumns}
            data={data?.data.items ?? []}
            isLoading={isLoading}
            emptyState={
              isError
                ? `Error: ${(error as Error)?.message}`
                : "No pending assets found."
            }
          />
        </TabsContent>
        <TabsContent value="verified" className="p-3">
          <DataTable
            columns={tableColumns}
            data={data?.data.items ?? []}
            isLoading={isLoading}
            emptyState={
              isError
                ? `Error: ${(error as Error)?.message}`
                : "No verified assets found."
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
