import { test, expect } from '@playwright/test';
import { TEST_CARDS, TEST_USER } from './stripe-test-data';

/**
 * Stripe決済失敗のテストケース
 * 残高不足のカードを使用して決済が失敗するケースをテスト
 */
test('決済失敗のテスト - 残高不足', async ({ page }) => {
  // ログインページに移動
  await page.goto('http://localhost:3000/login');
  
  // ログイン情報を入力
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  
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
  
  // 残高不足のテスト用カード情報を入力
  const insufficientCard = TEST_CARDS.insufficient;
  await stripePage.fill('input[name="cardNumber"]', insufficientCard.number);
  await stripePage.fill('input[name="cardExpiry"]', insufficientCard.expiry);
  await stripePage.fill('input[name="cardCvc"]', insufficientCard.cvc);
  await stripePage.fill('input[name="billingName"]', insufficientCard.name);
  
  // 決済ボタンをクリック
  await stripePage.click('button[type="submit"]');
  
  // エラーメッセージが表示されるのを待つ
  await stripePage.waitForSelector('text=カードの残高が不足しています');
  
  // エラーメッセージの内容を確認
  const errorText = await stripePage.textContent('.StripeError');
  expect(errorText).toContain('残高不足');
});

/**
 * 3Dセキュア認証のテストケース
 * 3Dセキュア認証が必要なカードを使用して認証フローをテスト
 */
test('3Dセキュア認証のテスト', async ({ page }) => {
  // ログインページに移動
  await page.goto('http://localhost:3000/login');
  
  // ログイン情報を入力
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  
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
  
  // 3Dセキュア認証が必要なテスト用カード情報を入力
  const threeDSecureCard = TEST_CARDS.threeDSecure;
  await stripePage.fill('input[name="cardNumber"]', threeDSecureCard.number);
  await stripePage.fill('input[name="cardExpiry"]', threeDSecureCard.expiry);
  await stripePage.fill('input[name="cardCvc"]', threeDSecureCard.cvc);
  await stripePage.fill('input[name="billingName"]', threeDSecureCard.name);
  
  // 決済ボタンをクリック
  await stripePage.click('button[type="submit"]');
  
  // 3Dセキュア認証ページが表示されるのを待つ
  await stripePage.waitForSelector('iframe[name*="3d-secure"]');
  
  // 3Dセキュア認証フレームに切り替え
  const frameHandle = await stripePage.waitForSelector('iframe[name*="3d-secure"]');
  const frame = await frameHandle.contentFrame();
  
  // 認証ページで「完了」ボタンをクリック
  await frame?.click('button:has-text("完了")');
  
  // 決済完了後、リダイレクト先のページが表示されるのを待つ
  await stripePage.waitForURL('**/success*');
  
  // 元のページに戻る
  await page.bringToFront();
  
  // ページをリロード
  await page.reload();
  
  // サブスクリプションのステータスが「アクティブ」になっているか確認
  await page.waitForSelector('text=アクティブ');
});
