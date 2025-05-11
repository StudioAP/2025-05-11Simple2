"use client";

import { AccessibleImage } from "@/components/ui/accessible-image";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // IntersectionObserverを使用して、画像が表示領域に入ったかどうかを検出
    if (!priority && typeof window !== "undefined" && "IntersectionObserver" in window) {
      const placeholder = document.getElementById(`placeholder-${src.replace(/\W+/g, "-")}`);
      
      if (placeholder) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsInView(true);
                observer.disconnect();
              }
            });
          },
          { rootMargin: "200px" } // 表示領域の200px手前で読み込みを開始
        );
        
        observer.observe(placeholder);
        
        return () => {
          observer.disconnect();
        };
      }
    } else {
      // priorityがtrueの場合や、IntersectionObserverがサポートされていない場合は即時読み込み
      setIsInView(true);
    }
  }, [src, priority]);

  // スタイルの設定
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  }[objectFit];

  return (
    <div
      id={`placeholder-${src.replace(/\W+/g, "-")}`}
      className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gray-800",
        className
      )}
      style={{ width, height }}
    >
      {(priority || isInView) && (
        <AccessibleImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            objectFitClass,
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          fallbackText="画像を読み込めませんでした"
          priority={priority}
        />
      )}
      
      {/* ローディングプレースホルダー */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
          <svg
            className="w-10 h-10 text-gray-300 dark:text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
