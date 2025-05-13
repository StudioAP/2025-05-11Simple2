import { Suspense, lazy, ReactNode } from "react";

// 遅延読み込みするコンポーネントを作成するヘルパー関数
export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);
  const defaultFallback = <div className="min-h-[100px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md"></div>;

  return function LazyWrappedComponent(props: T) {
    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}
