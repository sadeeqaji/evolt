"use client";

import * as React from "react";
import { AssetDoc } from "@evolt/types/pool";
import { Button } from "@evolt/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@evolt/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import Image from "next/image";
import { columns } from "./columns";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@evolt/lib/apiClient";
import { DataTable } from "../../data-table";

function EmptyState() {
  const { push } = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-black">
      <div className="p-4 bg-muted/50 rounded-lg mb-6">
        <Image
          src="/startInvesting.png"
          alt="Launch NFTs"
          width={120}
          height={90}
          className="object-contain"
        />
      </div>
      <h3 className="text-2xl font-semibold mb-2">Launch your asset</h3>
      <p className="text-muted-foreground mb-6 max-w-xs">
        Create a Primary Drop or Open Collection to get started.
      </p>
      <Button onClick={() => push(`/listing/new`)}>Get Started</Button>
    </div>
  );
}

async function fetchMyAssets(): Promise<AssetDoc[]> {
  const { data } = await apiClient.get("/asset/mine");

  const payload = data?.data;
  const list = Array.isArray(payload) ? payload : payload?.items;
  return Array.isArray(list) ? list : [];
}

export default function ListingClientPage() {
  const { push } = useRouter();

  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AssetDoc[]>({
    queryKey: ["myAssets"],
    queryFn: async () => {
      const assets = await fetchMyAssets();
      return assets;
    },
  });

  return (
    <div className="mt-10 w-full max-w-6xl m-auto space-y-4 ">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-medium text-foreground">My Assets</h2>

        <div className="space-x-3.5">
          <Button
            onClick={() => push(`/listing/new`)}
            size="lg"
            className="rounded-full shadow-lg h-10 px-6 bg-primary text-primary-foreground"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create new
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <span className="text-muted-foreground">
                  {isLoading ? "Refreshing…" : "Recently created"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => refetch()}>
                Refresh
              </DropdownMenuItem>
              <DropdownMenuItem>Recently created</DropdownMenuItem>
              <DropdownMenuItem>Recently listed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-black p-3">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          emptyState={
            isError ? `Error: ${(error as Error)?.message}` : <EmptyState />
          }
        />
      </div>
    </div>
  );
}
