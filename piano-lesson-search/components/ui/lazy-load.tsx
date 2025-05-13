"use client";

import { Suspense, lazy, ReactNode, useState, useEffect, useRef } from "react";

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
