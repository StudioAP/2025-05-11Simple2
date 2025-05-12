"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SkipLinkProps {
  targetId: string;
  className?: string;
}

/**
 * スキップリンクコンポーネント
 * キーボードユーザーがナビゲーションをスキップしてメインコンテンツに直接移動できるようにする
 */
export function SkipLink({ targetId, className }: SkipLinkProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "fixed top-4 left-4 z-50 p-3 bg-primary text-white rounded-md shadow-lg transform transition-transform",
        isFocused ? "translate-y-0" : "-translate-y-20",
        className
      )}
    >
      メインコンテンツにスキップ
    </a>
  );
}
