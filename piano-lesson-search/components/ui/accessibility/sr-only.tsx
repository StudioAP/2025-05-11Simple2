"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SrOnlyProps {
  children: ReactNode;
  className?: string;
}

/**
 * スクリーンリーダーのみに表示されるテキストを提供するコンポーネント
 * 視覚的には非表示だが、スクリーンリーダーには読み上げられる
 */
export function SrOnly({ children, className }: SrOnlyProps) {
  return (
    <span
      className={cn(
        "sr-only",
        className
      )}
    >
      {children}
    </span>
  );
}
