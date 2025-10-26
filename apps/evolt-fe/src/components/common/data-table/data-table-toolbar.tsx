"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@evolt/components/ui/button";
import { Input } from "@evolt/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

export interface ToolbarOptions {
  filterColumn: string;
  facetedFilters?: {
    column: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  toolbarOptions?: ToolbarOptions;
}

export function DataTableToolbar<TData>({
  table,
  toolbarOptions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {toolbarOptions?.filterColumn && (
          <Input
            placeholder="Filter..."
            value={
              (table
                .getColumn(toolbarOptions.filterColumn)
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn(toolbarOptions.filterColumn)
                ?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {toolbarOptions?.facetedFilters?.map((filter) => {
          return (
            table.getColumn(filter.column) && (
              <DataTableFacetedFilter
                key={filter.column}
                column={table.getColumn(filter.column)}
                title={filter.title}
                options={filter.options}
              />
            )
          );
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
