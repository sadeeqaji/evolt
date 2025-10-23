import { Info } from "lucide-react";
import { Card } from "@evolt/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  variant?: "default" | "approved" | "pending";
}

const StatCard = ({ title, value, variant = "default" }: StatCardProps) => {
  const getBorderColor = () => {
    switch (variant) {
      case "approved":
        return "border-stat-card-border";
      case "pending":
        return "border-stat-card-border";
      default:
        return "border-stat-card-border";
    }
  };

  return (
    <Card
      className={`bg-black border ${getBorderColor()} rounded-xl p-6 hover:border-stat-card-glow transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
      </div>
      <p className="text-4xl font-bold text-foreground">{value}</p>
    </Card>
  );
};

export default StatCard;
