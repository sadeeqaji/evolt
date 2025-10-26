import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: HelpCircle,
    color: "text-blue-500",
  },
  {
    value: "todo",
    label: "Todo",
    icon: Circle,
    color: "text-blue-500",
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: Timer,
    color: "text-yellow-500",
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CircleOff,
    color: "text-red-500",
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUp,
  },
];
