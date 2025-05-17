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
        {/* @ts-expect-error T is generally compatible with ComponentType<T> props, but TypeScript's inference can struggle with complex generics in HOCs. */}
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
