"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Collection } from "./schema";
import { DataTableColumnHeader } from "@evolt/components/common/data-table/data-table-column-header";
import { Checkbox } from "@evolt/components/ui/checkbox";

export const columns: ColumnDef<Collection>[] = [
  // I've omitted the "select" checkbox as it's not in the screenshot
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NAME" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "supply",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SUPPLY" />
    ),
  },
  {
    accessorKey: "items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ITEMS" />
    ),
  },
  {
    accessorKey: "floor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="FLOOR" />
    ),
  },
  {
    accessorKey: "totalVolume",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TOTAL VOLUME" />
    ),
  },
  {
    accessorKey: "sales",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SALES" />
    ),
  },
  {
    accessorKey: "owners",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="OWNERS" />
    ),
  },
  {
    accessorKey: "listed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="LISTED" />
    ),
  },
];
