"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface PageErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function PageError({
  title = "エラーが発生しました",
  message,
  onRetry,
}: PageErrorProps) {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          再試行
        </Button>
      )}
    </div>
  );
}
