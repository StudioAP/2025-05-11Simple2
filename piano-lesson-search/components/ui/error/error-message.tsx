"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, XCircle } from "lucide-react";

type ErrorSeverity = "info" | "warning" | "error";

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  className?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title,
  message,
  severity = "error",
  className,
  onRetry,
}: ErrorMessageProps) {
  const severityConfig = {
    info: {
      icon: AlertCircle,
      containerClass: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      borderClass: "border-blue-200 dark:border-blue-800",
    },
    warning: {
      icon: AlertTriangle,
      containerClass: "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      borderClass: "border-yellow-200 dark:border-yellow-800",
    },
    error: {
      icon: XCircle,
      containerClass: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      borderClass: "border-red-200 dark:border-red-800",
    },
  };

  const { icon: Icon, containerClass, borderClass } = severityConfig[severity];

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        containerClass,
        borderClass,
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className="mt-1 text-sm">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-white px-2 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                再試行
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
