"use client";

import { DataTable } from "../../data-table/";
import { columns } from "./columns";
import { priorities, statuses } from "./data";
import { Task } from "./schema";

export default function TasksClientPage({ tasks }: { tasks: Task[] }) {
  return (
    <div className="hidden h-full flex-1 flex-col gap-8  md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Task</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your tasks.
          </p>
        </div>
      </div>
      <DataTable
        data={tasks}
        columns={columns}
        toolbarOptions={{
          filterColumn: "title",
          facetedFilters: [
            {
              column: "status",
              title: "Status",
              options: statuses,
            },
            {
              column: "priority",
              title: "Priority",
              options: priorities,
            },
          ],
        }}
      />
    </div>
  );
}
