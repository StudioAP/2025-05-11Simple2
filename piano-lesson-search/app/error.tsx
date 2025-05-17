"use client";

import { PageError } from "@/components/ui/error/page-error";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-16 px-4">
      <PageError
        title="エラーが発生しました"
        message="申し訳ありませんが、予期せぬエラーが発生しました。再試行するか、しばらく時間を置いてからアクセスしてください。"
        onRetry={reset}
      />
    </div>
  );
} 