import { Page, expect } from '@playwright/test';

/**
 * E2Eテスト用のヘルパー関数群
 * テストの安定性向上と重複コードの削減のために使用します
 */

/**
 * ログイン処理を実行する
 * @param page Playwrightのページオブジェクト
 * @param email ログイン用メールアドレス
 * @param password ログイン用パスワード
 * @param expectedRedirect ログイン後に期待されるリダイレクト先（デフォルトは/dashboard）
 */
export async function login(
  page: Page, 
  email: string, 
  password: string,
  expectedRedirect: string = '/dashboard'
): Promise<void> {
  console.log(`${email} としてログイン処理を開始します`);
  
  // ログインページにアクセス
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // ログイン情報を入力
  await page.getByLabel('メールアドレス').fill(email);
  await page.locator('#password').fill(password);
  
  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // リダイレクトを待機（タイムアウト30秒）
  try {
    await expect(page).toHaveURL(new RegExp(`.*${expectedRedirect}`), { timeout: 30000 });
    console.log('ログイン成功: 正しくリダイレクトされました');
  } catch (error) {
    console.error('ログイン失敗: リダイレクトが確認できませんでした');
    // エラー画面のスクリーンショットを取得
    await page.screenshot({ path: `error-login-${new Date().toISOString().replace(/:/g, '-')}.png` });
    throw error;
  }
}

/**
 * 要素が表示されるまで待機して操作する
 * @param page Playwrightのページオブジェクト
 * @param selector 操作対象の要素のセレクタ
 * @param action 実行する操作（'click', 'fill', 'check'など）
 * @param value 入力する値（actionがfillの場合のみ使用）
 */
export async function waitAndAct(
  page: Page,
  selector: string,
  action: 'click' | 'fill' | 'check' | 'select' = 'click',
  value?: string
): Promise<void> {
  try {
    // 要素が表示されるまで待機
    await page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
    
    // 指定されたアクションを実行
    switch (action) {
      case 'click':
        await page.locator(selector).click();
        break;
      case 'fill':
        if (value !== undefined) {
          await page.locator(selector).fill(value);
        } else {
          throw new Error('fill アクションには value が必要です');
        }
        break;
      case 'check':
        await page.locator(selector).check();
        break;
      case 'select':
        if (value !== undefined) {
          await page.locator(selector).selectOption(value);
        } else {
          throw new Error('select アクションには value が必要です');
        }
        break;
    }
  } catch (error) {
    console.error(`要素 "${selector}" の操作中にエラーが発生しました:`, error);
    // エラー画面のスクリーンショットを取得
    await page.screenshot({ path: `error-element-${selector.replace(/[^\w]/g, '_')}-${new Date().toISOString().replace(/:/g, '-')}.png` });
    throw error;
  }
}

/**
 * フォームフィールドにデータを入力する
 * @param page Playwrightのページオブジェクト
 * @param fields 入力するフィールドのマップ { セレクタ: 値 }
 */
export async function fillFormFields(
  page: Page,
  fields: Record<string, string>
): Promise<void> {
  for (const [selector, value] of Object.entries(fields)) {
    try {
      await page.locator(selector).fill(value);
    } catch (error) {
      console.error(`フィールド "${selector}" への入力中にエラーが発生しました:`, error);
      await page.screenshot({ path: `error-form-field-${selector.replace(/[^\w]/g, '_')}-${new Date().toISOString().replace(/:/g, '-')}.png` });
      throw error;
    }
  }
}

/**
 * エラーメッセージをチェックする
 * @param page Playwrightのページオブジェクト
 * @param expectedText 期待されるエラーメッセージのテキスト
 */
export async function expectErrorMessage(
  page: Page,
  expectedText: string
): Promise<void> {
  try {
    // エラーメッセージ要素が表示されるまで待機
    await expect(page.locator('.error-message, [role="alert"]')).toContainText(expectedText, { timeout: 5000 });
  } catch (error) {
    console.error(`エラーメッセージ "${expectedText}" が見つかりませんでした`);
    await page.screenshot({ path: `error-message-not-found-${new Date().toISOString().replace(/:/g, '-')}.png` });
    throw error;
  }
}

/**
 * サクセスメッセージをチェックする
 * @param page Playwrightのページオブジェクト
 * @param expectedText 期待されるサクセスメッセージのテキスト
 */
export async function expectSuccessMessage(
  page: Page,
  expectedText: string
): Promise<void> {
  try {
    // サクセスメッセージ要素が表示されるまで待機
    await expect(page.locator('.success-message, [role="status"]')).toContainText(expectedText, { timeout: 5000 });
  } catch (error) {
    console.error(`サクセスメッセージ "${expectedText}" が見つかりませんでした`);
    await page.screenshot({ path: `success-message-not-found-${new Date().toISOString().replace(/:/g, '-')}.png` });
    throw error;
  }
}
