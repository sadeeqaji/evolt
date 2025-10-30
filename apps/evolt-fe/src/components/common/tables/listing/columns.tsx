"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AssetDoc } from "@evolt/types/pool";
import { DataTableColumnHeader } from "@evolt/components/common/data-table/data-table-column-header";
import { Badge } from "@evolt/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<AssetDoc>[] = [
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
];
