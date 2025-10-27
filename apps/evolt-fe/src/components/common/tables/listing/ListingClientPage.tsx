"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@evolt/components/ui/table";
import { Button } from "@evolt/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@evolt/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import Image from "next/image";
import { Collection } from "./schema";
import { columns } from "./columns";
import { useRouter } from "next/navigation";

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

export default function ListingClientPage() {
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const { push } = useRouter();
  const table = useReactTable({
    data: collections,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-10 w-full max-w-6xl m-auto space-y-4 ">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-medium text-foreground" />

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
                <span className="text-muted-foreground">Recently created</span>
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Recently created</DropdownMenuItem>
              <DropdownMenuItem>Recently listed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-border bg-black">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b-border"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground uppercase text-xs font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {collections.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0 border-b-0">
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
