/**
 * アクセシビリティ関連のユーティリティ関数
 */

/**
 * キーボードイベントを処理し、特定のキーが押された場合にコールバックを実行する
 * @param event キーボードイベント
 * @param key 対象のキー
 * @param callback 実行するコールバック関数
 */
export function handleKeyboardEvent(
  event: React.KeyboardEvent,
  key: string,
  callback: () => void
) {
  if (event.key === key) {
    event.preventDefault();
    callback();
  }
}

/**
 * Enterキーまたはスペースキーが押された場合にコールバックを実行する
 * ボタンやクリック可能な要素のキーボードアクセシビリティ向上に使用
 * @param event キーボードイベント
 * @param callback 実行するコールバック関数
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

/**
 * 要素にアクセシビリティ属性を追加するためのヘルパー関数
 * @param isInteractive 要素がインタラクティブかどうか
 * @returns アクセシビリティ属性のオブジェクト
 */
export function getA11yProps(isInteractive: boolean = false) {
  const baseProps = {
    role: "region",
    "aria-label": "コンテンツ領域",
  };

  if (isInteractive) {
    return {
      ...baseProps,
      tabIndex: 0,
      role: "button",
      "aria-label": "クリック可能な領域",
    };
  }

  return baseProps;
}

/**
 * スクリーンリーダー専用のテキストを提供するコンポーネント用のクラス名
 */
export const srOnlyClass = "sr-only";

/**
 * アクセシビリティ関連のメッセージを生成する
 * @param type メッセージのタイプ
 * @returns アクセシビリティメッセージ
 */
export function getA11yMessage(type: "loading" | "success" | "error" | "info") {
  switch (type) {
    case "loading":
      return "コンテンツを読み込み中です。しばらくお待ちください。";
    case "success":
      return "操作が完了しました。";
    case "error":
      return "エラーが発生しました。もう一度お試しください。";
    case "info":
      return "情報が更新されました。";
    default:
      return "";
  }
}

/**
 * フォーカス管理のためのユーティリティ
 * @param elementId フォーカスする要素のID
 */
export function focusElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
  }
}

/**
 * 要素がビューポート内に表示されているかを確認する
 * @param element 確認する要素
 * @returns ビューポート内に表示されているかどうか
 */
export function isElementInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 要素が表示されていない場合にスクロールして表示する
 * @param elementId スクロール先の要素ID
 * @param behavior スクロール動作
 */
export function scrollToElementIfNeeded(
  elementId: string,
  behavior: ScrollBehavior = "smooth"
) {
  const element = document.getElementById(elementId);
  if (element && !isElementInViewport(element)) {
    element.scrollIntoView({ behavior, block: "nearest" });
  }
}
