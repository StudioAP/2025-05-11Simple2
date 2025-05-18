import { WebElement } from 'selenium-webdriver';

/**
 * WebElementのラッパークラス。
 * getText()やclear()などのメソッドに関する型エラーを回避するためのヘルパーメソッドを提供します。
 */
export class ElementHelper {
  /**
   * WebElementからテキスト内容を取得します
   * @param element 操作対象のWebElement
   * @returns テキスト内容
   */
  static async getText(element: WebElement): Promise<string> {
    // 内部的には適切な型変換を行って処理します
    return await (element as any).getText();
  }

  /**
   * 入力フィールドの内容をクリアします
   * @param element 操作対象のWebElement（入力フィールド）
   */
  static async clear(element: WebElement): Promise<void> {
    await (element as any).clear();
  }

  /**
   * 要素が表示されているかどうかを確認します
   * @param element 確認対象のWebElement
   * @returns 表示されていればtrue
   */
  static async isDisplayed(element: WebElement): Promise<boolean> {
    return await (element as any).isDisplayed();
  }

  /**
   * 要素が有効化されているかどうかを確認します
   * @param element 確認対象のWebElement
   * @returns 有効化されていればtrue
   */
  static async isEnabled(element: WebElement): Promise<boolean> {
    return await (element as any).isEnabled();
  }

  /**
   * 要素をクリックします
   * @param element クリック対象のWebElement
   */
  static async click(element: WebElement): Promise<void> {
    await element.click();
  }
}

/**
 * 指定したミリ秒だけ待機します
 * @param ms 待機ミリ秒
 * @returns 待機を解決するPromise
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 