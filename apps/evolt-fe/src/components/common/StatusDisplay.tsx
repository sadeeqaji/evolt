"use client";

import React from "react";
import { cn } from "@evolt/lib/utils";
import {
  AlertTriangle,
  XCircle,
  Info,
  DatabaseZap,
  type LucideIcon,
} from "lucide-react";

type StatusType = "error" | "warning" | "info" | "empty";

interface StatusDisplayProps {
  type: StatusType;
  title?: string;
  message: string;
  icon?: LucideIcon;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { icon: LucideIcon; bgClass: string; borderClass: string; iconClass: string }
> = {
  error: {
    icon: XCircle,
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/30",
    iconClass: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    iconClass: "text-yellow-500",
  },
  info: {
    icon: Info,
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    iconClass: "text-blue-500",
  },
  empty: {
    icon: DatabaseZap, // Icon suggesting 'no data' or 'empty state'
    bgClass: "bg-muted/50",
    borderClass: "border-border",
    iconClass: "text-muted-foreground",
  },
};

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  type,
  title,
  message,
  icon: customIcon,
  className,
}) => {
  const config = statusConfig[type];
  const IconComponent = customIcon || config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border p-4 animate-in fade-in-0 slide-in-from-top-2 duration-500",
        config.bgClass,
        config.borderClass,
        className
      )}
      role="alert"
    >
      <div className={cn("mt-1 flex-shrink-0", config.iconClass)}>
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="flex-1">
        {title && (
          <h3 className="mb-1 text-sm font-semibold text-foreground">
            {title}
          </h3>
        )}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
