"use client";

import { Spinner } from "./spinner";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "読み込み中..." }: PageLoaderProps) {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-center text-gray-500 dark:text-gray-400">
        {message}
      </p>
    </div>
  );
}
