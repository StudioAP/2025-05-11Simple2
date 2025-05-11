"use client";

import { Suspense, lazy, ReactNode } from "react";

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
}

export function LazyLoad({
  children,
  fallback = <div className="min-h-[100px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md"></div>,
  threshold = 0.1,
}: LazyLoadProps) {
  return (
    <Suspense fallback={fallback}>
      <LazyLoadInner threshold={threshold}>{children}</LazyLoadInner>
    </Suspense>
  );
}

interface LazyLoadInnerProps {
  children: ReactNode;
  threshold: number;
}

function LazyLoadInner({ children, threshold }: LazyLoadInnerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : null}
    </div>
  );
}

// useStateとuseEffectをインポート
import { useState, useEffect, useRef } from "react";

// 遅延読み込みするコンポーネントを作成するヘルパー関数
export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrappedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <div className="min-h-[100px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md"></div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
