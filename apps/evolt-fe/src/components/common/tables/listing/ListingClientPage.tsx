"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@evolt/components/ui/table";
import { Button } from "@evolt/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@evolt/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import Image from "next/image";
import { columns } from "./columns";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@evolt/lib/apiClient";

type AssetDoc = {
  _id: string;
  title?: string;
  status?: string;
  createdAt?: string;
  symbol?: string;
  amount?: number;
  currency?: string;
};


type Row = {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
};

function mapAssetToRow(a: AssetDoc): Row {
  return {
    id: a._id,
    name: a.title || "Untitled",
    status: a.status,
    createdAt: a.createdAt,
  };
}

function ListingSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-black">
      <div className="p-6 space-y-4">
        <div className="h-4 w-40 animate-pulse rounded bg-muted/30" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-full animate-pulse rounded bg-muted/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const { push } = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-black">
      <div className="p-4 bg-muted/50 rounded-lg mb-6">
        <Image src="/startInvesting.png" alt="Launch NFTs" width={120} height={90} className="object-contain" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">Launch your asset</h3>
      <p className="text-muted-foreground mb-6 max-w-xs">
        Create a Primary Drop or Open Collection to get started.
      </p>
      <Button onClick={() => push(`/listing/new`)}>Get Started</Button>
    </div>
  );
}

function useAuthToken() {
  const [token, setToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    const t =
      sessionStorage.getItem("accessToken") ||
      sessionStorage.getItem("investorAccessToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("investorAccessToken");
    setToken(t);
  }, []);
  return token;
}

async function fetchMyAssets(token: string): Promise<AssetDoc[]> {
  const { data } = await apiClient.get("/asset/mine", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const payload = data?.data;
  const list = Array.isArray(payload) ? payload : payload?.items;
  return Array.isArray(list) ? list : [];
}

export default function ListingClientPage() {
  const { push } = useRouter();
  const token = useAuthToken();

  const { data: rows = [], isFetching, isError, error, refetch } = useQuery({
    queryKey: ["myAssets", token],
    enabled: !!token,
    queryFn: async () => {
      const assets = await fetchMyAssets(token!);
      const mapped = assets.map(mapAssetToRow);
      return mapped;
    },
  });

  const table = useReactTable({
    data: rows,
    columns: columns as unknown as ColumnDef<Row, any>[],
    getCoreRowModel: getCoreRowModel(),
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
                  {isFetching ? "Refreshing…" : "Recently created"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => refetch()}>Refresh</DropdownMenuItem>
              <DropdownMenuItem>Recently created</DropdownMenuItem>
              <DropdownMenuItem>Recently listed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!token || isFetching ? (
        <ListingSkeleton />
      ) : isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {(error as Error)?.message || "Failed to load assets."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-black">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-border">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-muted-foreground uppercase text-xs font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={(columns as any).length} className="p-0 border-b-0">
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}