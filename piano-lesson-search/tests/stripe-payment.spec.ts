import { test, expect } from '@playwright/test';

/**
 * Stripeの決済フローをテストするE2Eテスト
 * テスト用カード情報を使用して、サブスクリプション登録のフローをシミュレートします
 */
test('サブスクリプション登録フローのテスト', async ({ page }) => {
  // ログインページに移動
  await page.goto('http://localhost:3000/login');
  
  // ログイン情報を入力
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // ログインボタンをクリック
  await page.click('button[type="submit"]');
  
  // ダッシュボードページに遷移するのを待つ
  await page.waitForURL('**/dashboard');
  
  // サブスクリプションページに移動
  await page.goto('http://localhost:3000/dashboard/subscription');
  
  // サブスクリプション開始ボタンが表示されるのを待つ
  await page.waitForSelector('button:has-text("サブスクリプションを開始する")');
  
  // サブスクリプション開始ボタンをクリック
  await page.click('button:has-text("サブスクリプションを開始する")');
  
  // 新しいタブでStripeの決済ページが開くのを待つ
  const pagePromise = page.context().waitForEvent('page');
  const stripePage = await pagePromise;
  await stripePage.waitForLoadState();
  
  // Stripeの決済ページのURLを確認
  expect(stripePage.url()).toContain('checkout.stripe.com');
  
  // テスト用カード情報を入力
  await stripePage.fill('input[name="cardNumber"]', '4242 4242 4242 4242');
  await stripePage.fill('input[name="cardExpiry"]', '12 / 25');
  await stripePage.fill('input[name="cardCvc"]', '123');
  await stripePage.fill('input[name="billingName"]', 'テスト ユーザー');
  
  // 決済ボタンをクリック
  await stripePage.click('button[type="submit"]');
  
  // 決済完了後、リダイレクト先のページが表示されるのを待つ
  await stripePage.waitForURL('**/success*');
  
  // 元のページに戻る
  await page.bringToFront();
  
  // ページをリロード
  await page.reload();
  
  // サブスクリプションのステータスが「アクティブ」になっているか確認
  await page.waitForSelector('text=アクティブ');
  
  // キャンセルボタンが表示されているか確認
  const cancelButton = await page.isVisible('button:has-text("サブスクリプションを解約する")');
  expect(cancelButton).toBeTruthy();
});

/**
 * サブスクリプションのキャンセルフローをテストするE2Eテスト
 */
test('サブスクリプションキャンセルフローのテスト', async ({ page }) => {
  // ログインページに移動
  await page.goto('http://localhost:3000/login');
  
  // ログイン情報を入力
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // ログインボタンをクリック
  await page.click('button[type="submit"]');
  
  // ダッシュボードページに遷移するのを待つ
  await page.waitForURL('**/dashboard');
  
  // サブスクリプションページに移動
  await page.goto('http://localhost:3000/dashboard/subscription');
  
  // サブスクリプションが「アクティブ」状態であることを確認
  await page.waitForSelector('text=アクティブ');
  
  // キャンセルボタンをクリック
  await page.click('button:has-text("サブスクリプションを解約する")');
  
  // 確認ダイアログでOKをクリック
  page.on('dialog', dialog => dialog.accept());
  
  // キャンセル完了のメッセージが表示されるのを待つ
  await page.waitForSelector('text=キャンセル完了');
  
  // ステータスが「キャンセル済み」になっているか確認
  await page.waitForSelector('text=次回更新日をもって終了します');
});
