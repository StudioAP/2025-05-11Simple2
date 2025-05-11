/**
 * パフォーマンス最適化のためのユーティリティ関数
 */

/**
 * 遅延読み込みするコンポーネントの表示閾値を設定する
 * @param element 対象要素
 * @param threshold 表示閾値（0-1）
 * @param callback 表示された時のコールバック
 */
export function observeIntersection(
  element: Element | null,
  threshold: number = 0.1,
  callback: (isIntersecting: boolean) => void
): () => void {
  if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    callback(true);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
      });
    },
    { threshold, rootMargin: '200px' }
  );

  observer.observe(element);
  return () => observer.disconnect();
}

/**
 * 画像の遅延読み込みを行う
 * @param imgElement 画像要素
 * @param src 画像のソースURL
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement | null,
  src: string
): () => void {
  if (!imgElement) return () => {};

  return observeIntersection(imgElement, 0.1, (isIntersecting) => {
    if (isIntersecting) {
      imgElement.src = src;
      imgElement.classList.remove('opacity-0');
      imgElement.classList.add('opacity-100');
    }
  });
}

/**
 * リソースのプリロードを行う
 * @param urls プリロードするURLの配列
 * @param type リソースのタイプ
 */
export function preloadResources(
  urls: string[],
  type: 'image' | 'style' | 'script' = 'image'
): void {
  if (typeof window === 'undefined') return;

  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  });
}

/**
 * コンポーネントのレンダリングパフォーマンスを計測する
 * @param componentName コンポーネント名
 * @param callback 計測するコールバック関数
 */
export function measureRenderPerformance<T>(
  componentName: string,
  callback: () => T
): T {
  if (process.env.NODE_ENV !== 'development') {
    return callback();
  }

  console.time(`Render time for ${componentName}`);
  const result = callback();
  console.timeEnd(`Render time for ${componentName}`);
  return result;
}

/**
 * デバウンス関数
 * @param func 実行する関数
 * @param wait 待機時間（ミリ秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * スロットル関数
 * @param func 実行する関数
 * @param limit 制限時間（ミリ秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
