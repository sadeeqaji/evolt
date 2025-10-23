import { MoreVertical } from "lucide-react";
import { Button } from "@evolt/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@evolt/components/ui/dropdown-menu";

interface Invoice {
  id: string;
  companyName: string;
  clientEmail: string;
  invoiceNumber: string;
  amount: string;
  status: "Approved" | "Pending" | "Rejected";
}

interface InvoiceTableProps {
  invoices: Invoice[];
}

const InvoiceTable = ({ invoices }: InvoiceTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-400";
      case "Pending":
        return "text-yellow-400";
      case "Rejected":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead className="bg-table-header">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Company Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">{`Client's Email`}</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Invoice Number
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="bg-table-row hover:bg-table-row-hover transition-colors border-t border-border"
            >
              <td className="px-6 py-4 text-sm text-foreground">
                {invoice.companyName}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {invoice.clientEmail}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {invoice.invoiceNumber}
              </td>
              <td className="px-6 py-4 text-sm text-foreground">
                {invoice.amount}
              </td>
              <td
                className={`px-6 py-4 text-sm font-medium ${getStatusColor(
                  invoice.status
                )}`}
              >
                {invoice.status}
              </td>
              <td className="px-6 py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border"
                  >
                    <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                      Edit Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-secondary cursor-pointer text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
