"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AssetDoc } from "@evolt/types/pool";
import { DataTableColumnHeader } from "@evolt/components/common/data-table/data-table-column-header";
import { DataTableRowActions } from "@evolt/components/common/data-table/data-table-row-actions";
import { Badge } from "@evolt/components/ui/badge";
import { Button } from "@evolt/components/ui/button";
import apiClient from "@evolt/lib/apiClient";
import { toast } from "sonner";
import { CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

const verifyAssetAction = async (
  assetId: string,
  verifierName: string,
  onSuccess: () => void
) => {
  const loadingToastId = toast.loading("Verifying asset...");
  const token = sessionStorage.getItem("adminAccessToken");

  try {
    await apiClient.post(
      `/asset/verify`,
      { id: assetId, verifier: verifierName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("Asset verified successfully!", { id: loadingToastId });
    onSuccess();
  } catch (error: any) {
    console.error("Verification failed:", error);
    toast.error(error.response?.data?.message || "Verification failed.", {
      id: loadingToastId,
    });
  }
};

export const columns = (onVerifySuccess: () => void): ColumnDef<AssetDoc>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.title ?? "N/A"}</div>
    ),
  },
  {
    accessorKey: "assetType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.assetType}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <span>
        {row.original.amount?.toLocaleString() ?? "N/A"} {row.original.currency}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "verified" ? "default" : "outline"}
        className="capitalize"
      >
        {row.original.status === "verified" ? (
          <CheckCircle className="mr-1 h-3 w-3" />
        ) : (
          <Clock className="mr-1 h-3 w-3" />
        )}
        {row.original.status}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <span>
        {new Date(row.original.createdAt ?? Date.now()).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "blobUrl",
    header: "Document",
    cell: ({ row }) =>
      row.original.blobUrl ? (
        <Link
          href={row.original.blobUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View
        </Link>
      ) : (
        <span>-</span>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const asset = row.original;
      const isAdmin = true;
      const verifierName = "Admin User";

      const actions = [];

      if (asset.status === "pending") {
        actions.push({
          label: "Verify Asset",
          onClick: () =>
            verifyAssetAction(asset._id, verifierName, onVerifySuccess),
        });
      }

      return actions.length > 0 ? (
        <DataTableRowActions row={row} actions={actions} />
      ) : null;
    },
  },
];
