"use client";

import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Spinner({ size = "md", className, text }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <RefreshCw
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
}
