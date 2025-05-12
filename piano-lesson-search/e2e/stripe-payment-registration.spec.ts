import { test, expect } from '@playwright/test';

/**
 * 教室運営者向けE2Eテスト - 教室情報登録
 * 
 * このテストでは以下を検証します：
 * 1. ログインが正常に行えること
 * 2. 教室情報の登録が正常に行えること
 */

// テスト用ユーザー情報
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

// テスト用教室情報
const TEST_SCHOOL = {
  name: 'テスト音楽教室',
  url: 'https://example.com',
  area: '東京都渋谷区',
  description: 'これはテスト用の音楽教室です。ピアノとリトミックのレッスンを提供しています。',
  contact_email: 'contact@example.com'
};

/**
 * 教室情報登録テスト
 */
test('教室情報を登録できること', async ({ page }) => {
  console.log('教室情報登録テストを開始します');
  
  // ログイン
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  console.log('ページタイトル:', await page.title());
  
  // ログイン情報を入力
  await page.getByLabel('メールアドレス').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  
  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // ダッシュボードページに遷移することを確認
  await expect(page).toHaveURL(/.*dashboard/);
  
  // 教室情報編集ページへ移動
  await page.goto('/dashboard/school');
  await page.waitForLoadState('networkidle');
  
  // 教室情報を入力
  // 教室種別を選択
  await page.getByRole('combobox').first().click();
  await page.getByRole('option').first().click();
  
  // 各フィールドに入力
  await page.locator('input[name="name"]').fill(TEST_SCHOOL.name);
  await page.locator('input[name="url"]').fill(TEST_SCHOOL.url);
  await page.locator('input[name="area"]').fill(TEST_SCHOOL.area);
  await page.locator('textarea[name="description"]').fill(TEST_SCHOOL.description);
  await page.locator('input[name="contact_email"]').fill(TEST_SCHOOL.contact_email);
  
  // コンソールエラーを監視
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`ブラウザコンソールエラー: ${msg.text()}`);
    }
  });
  
  // 保存ボタンをクリック
  await page.getByRole('button', { name: '保存' }).click();
  
  // 保存成功メッセージが表示されることを確認
  try {
    await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 });
    console.log('教室情報が正常に保存されました');
  } catch (e) {
    // エラーが発生した場合は詳細を出力
    console.error('教室情報の保存中にエラーが発生しました');
    console.error('検出されたコンソールエラー:', errors);
    
    // スクリーンショットを取得
    await page.screenshot({ path: 'error-school-registration.png' });
    
    // エラーを再スロー
    throw e;
  }
});
