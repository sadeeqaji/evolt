"use client";
import { useState } from "react";
import { Search, Filter, FileText } from "lucide-react";
import StatCard from "@evolt/components/features/sme/StatCard";
import InvoiceTable from "@evolt/components/features/sme/InvoiceTable";
import { Button } from "@evolt/components/ui/button";
import { Input } from "@evolt/components/ui/input";

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockInvoices = [
    {
      id: "1",
      companyName: "Dangote Group Of Company",
      clientEmail: "dangotegroup@gmail.com",
      invoiceNumber: "EV-R8dbwtyuuuisby8w24",
      amount: "50,350,500",
      status: "Approved" as const,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Invoice" value={718} variant="default" />
        <StatCard title="Approved Invoice" value={711} variant="approved" />
        <StatCard title="Pending Invoice" value={7} variant="pending" />
      </div>

      <div className="bg-black rounded-2xl border border-border p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            All Invoice Log
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border focus:border-primary"
              />
            </div>

            <Button
              variant="outline"
              className="bg-input border-border hover:bg-secondary"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        <InvoiceTable invoices={mockInvoices} />
      </div>
    </div>
  );
};

export default Page;
