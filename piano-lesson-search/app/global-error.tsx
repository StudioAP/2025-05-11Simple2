"use client";

import { PageError } from "@/components/ui/error/page-error";
import { Providers } from "@/components/providers";
import { geistSans } from "./config";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja" className={geistSans.className}>
      <body className="bg-background text-foreground">
        <Providers>
          <div className="min-h-screen flex flex-col items-center justify-center">
            <PageError
              title="致命的なエラーが発生しました"
              message="申し訳ありませんが、サイト全体に問題が発生しています。管理者に連絡するか、後でもう一度試してください。"
              onRetry={reset}
            />
          </div>
        </Providers>
      </body>
    </html>
  );
} 