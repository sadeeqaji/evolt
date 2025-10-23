"use client";

import { useRouter } from "next/navigation";
import { Button } from "@evolt/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@evolt/lib/utils";

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function BackButton({
  label = "Back",
  onClick,
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) return onClick();
    router.back();
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl px-3",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
