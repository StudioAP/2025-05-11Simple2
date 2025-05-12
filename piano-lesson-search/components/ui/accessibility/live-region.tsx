"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LiveRegionProps {
  message: string;
  ariaLive?: "polite" | "assertive";
  clearAfter?: number; // ミリ秒単位
  className?: string;
}

/**
 * ライブリージョンコンポーネント
 * スクリーンリーダーに動的な変更を通知するために使用
 */
export function LiveRegion({
  message,
  ariaLive = "polite",
  clearAfter = 5000,
  className,
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (message && clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage("");
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  if (!currentMessage) {
    return null;
  }

  return (
    <div
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {currentMessage}
    </div>
  );
}
