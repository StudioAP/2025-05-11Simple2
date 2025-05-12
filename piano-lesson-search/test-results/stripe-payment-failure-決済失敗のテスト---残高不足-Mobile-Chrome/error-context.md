# Test info

- Name: 決済失敗のテスト - 残高不足
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/stripe-payment-failure.spec.ts:8:5

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/stripe-payment-failure.spec.ts:13:14
```

# Page snapshot

```yaml
- link "メインコンテンツにスキップ":
  - /url: "#main-content"
- banner:
  - link "ピアノ・リトミック教室検索":
    - /url: /
  - button:
    - img
  - button:
    - img
- main:
  - heading "ログイン" [level=1]
  - paragraph: 教室運営者向けのログインページです
  - text: メールアドレス
  - textbox "メールアドレス"
  - text: パスワード
  - link "パスワードをお忘れですか？":
    - /url: /reset-password
  - textbox "パスワード"
  - button "ログイン"
  - paragraph:
    - text: アカウントをお持ちでない方は
    - link "新規登録":
      - /url: /signup
- button "アクセシビリティメニューを開く":
  - img
- contentinfo:
  - paragraph: © 2025 ピアノ・リトミック教室検索 All rights reserved.
  - paragraph:
    - text: Powered by
    - link "Supabase":
      - /url: https://supabase.com
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { TEST_CARDS, TEST_USER } from './stripe-test-data';
   3 |
   4 | /**
   5 |  * Stripe決済失敗のテストケース
   6 |  * 残高不足のカードを使用して決済が失敗するケースをテスト
   7 |  */
   8 | test('決済失敗のテスト - 残高不足', async ({ page }) => {
   9 |   // ログインページに移動
   10 |   await page.goto('http://localhost:3000/login');
   11 |   
   12 |   // ログイン情報を入力
>  13 |   await page.fill('input[name="email"]', TEST_USER.email);
      |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
   14 |   await page.fill('input[name="password"]', TEST_USER.password);
   15 |   
   16 |   // ログインボタンをクリック
   17 |   await page.click('button[type="submit"]');
   18 |   
   19 |   // ダッシュボードページに遷移するのを待つ
   20 |   await page.waitForURL('**/dashboard');
   21 |   
   22 |   // サブスクリプションページに移動
   23 |   await page.goto('http://localhost:3000/dashboard/subscription');
   24 |   
   25 |   // サブスクリプション開始ボタンが表示されるのを待つ
   26 |   await page.waitForSelector('button:has-text("サブスクリプションを開始する")');
   27 |   
   28 |   // サブスクリプション開始ボタンをクリック
   29 |   await page.click('button:has-text("サブスクリプションを開始する")');
   30 |   
   31 |   // 新しいタブでStripeの決済ページが開くのを待つ
   32 |   const pagePromise = page.context().waitForEvent('page');
   33 |   const stripePage = await pagePromise;
   34 |   await stripePage.waitForLoadState();
   35 |   
   36 |   // Stripeの決済ページのURLを確認
   37 |   expect(stripePage.url()).toContain('checkout.stripe.com');
   38 |   
   39 |   // 残高不足のテスト用カード情報を入力
   40 |   const insufficientCard = TEST_CARDS.insufficient;
   41 |   await stripePage.fill('input[name="cardNumber"]', insufficientCard.number);
   42 |   await stripePage.fill('input[name="cardExpiry"]', insufficientCard.expiry);
   43 |   await stripePage.fill('input[name="cardCvc"]', insufficientCard.cvc);
   44 |   await stripePage.fill('input[name="billingName"]', insufficientCard.name);
   45 |   
   46 |   // 決済ボタンをクリック
   47 |   await stripePage.click('button[type="submit"]');
   48 |   
   49 |   // エラーメッセージが表示されるのを待つ
   50 |   await stripePage.waitForSelector('text=カードの残高が不足しています');
   51 |   
   52 |   // エラーメッセージの内容を確認
   53 |   const errorText = await stripePage.textContent('.StripeError');
   54 |   expect(errorText).toContain('残高不足');
   55 | });
   56 |
   57 | /**
   58 |  * 3Dセキュア認証のテストケース
   59 |  * 3Dセキュア認証が必要なカードを使用して認証フローをテスト
   60 |  */
   61 | test('3Dセキュア認証のテスト', async ({ page }) => {
   62 |   // ログインページに移動
   63 |   await page.goto('http://localhost:3000/login');
   64 |   
   65 |   // ログイン情報を入力
   66 |   await page.fill('input[name="email"]', TEST_USER.email);
   67 |   await page.fill('input[name="password"]', TEST_USER.password);
   68 |   
   69 |   // ログインボタンをクリック
   70 |   await page.click('button[type="submit"]');
   71 |   
   72 |   // ダッシュボードページに遷移するのを待つ
   73 |   await page.waitForURL('**/dashboard');
   74 |   
   75 |   // サブスクリプションページに移動
   76 |   await page.goto('http://localhost:3000/dashboard/subscription');
   77 |   
   78 |   // サブスクリプション開始ボタンが表示されるのを待つ
   79 |   await page.waitForSelector('button:has-text("サブスクリプションを開始する")');
   80 |   
   81 |   // サブスクリプション開始ボタンをクリック
   82 |   await page.click('button:has-text("サブスクリプションを開始する")');
   83 |   
   84 |   // 新しいタブでStripeの決済ページが開くのを待つ
   85 |   const pagePromise = page.context().waitForEvent('page');
   86 |   const stripePage = await pagePromise;
   87 |   await stripePage.waitForLoadState();
   88 |   
   89 |   // Stripeの決済ページのURLを確認
   90 |   expect(stripePage.url()).toContain('checkout.stripe.com');
   91 |   
   92 |   // 3Dセキュア認証が必要なテスト用カード情報を入力
   93 |   const threeDSecureCard = TEST_CARDS.threeDSecure;
   94 |   await stripePage.fill('input[name="cardNumber"]', threeDSecureCard.number);
   95 |   await stripePage.fill('input[name="cardExpiry"]', threeDSecureCard.expiry);
   96 |   await stripePage.fill('input[name="cardCvc"]', threeDSecureCard.cvc);
   97 |   await stripePage.fill('input[name="billingName"]', threeDSecureCard.name);
   98 |   
   99 |   // 決済ボタンをクリック
  100 |   await stripePage.click('button[type="submit"]');
  101 |   
  102 |   // 3Dセキュア認証ページが表示されるのを待つ
  103 |   await stripePage.waitForSelector('iframe[name*="3d-secure"]');
  104 |   
  105 |   // 3Dセキュア認証フレームに切り替え
  106 |   const frameHandle = await stripePage.waitForSelector('iframe[name*="3d-secure"]');
  107 |   const frame = await frameHandle.contentFrame();
  108 |   
  109 |   // 認証ページで「完了」ボタンをクリック
  110 |   await frame?.click('button:has-text("完了")');
  111 |   
  112 |   // 決済完了後、リダイレクト先のページが表示されるのを待つ
  113 |   await stripePage.waitForURL('**/success*');
```