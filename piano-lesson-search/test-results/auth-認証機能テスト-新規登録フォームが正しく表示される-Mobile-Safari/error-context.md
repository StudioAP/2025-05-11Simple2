# Test info

- Name: 認証機能テスト >> 新規登録フォームが正しく表示される
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/auth.spec.ts:11:7

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: getByLabel('パスワード') resolved to 2 elements:
    1) <input value="" required="" id="password" type="password" name="password" placeholder="8文字以上" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"/> aka getByRole('textbox', { name: 'パスワード', exact: true })
    2) <input value="" required="" type="password" id="confirmPassword" name="confirmPassword" placeholder="パスワードを再入力" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"/> aka getByRole('textbox', { name: 'パスワード（確認）' })

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByLabel('パスワード')

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/auth.spec.ts:21:44
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
  - heading "新規登録" [level=1]
  - paragraph: 教室運営者向けの新規登録ページです
  - alert: 登録後、ご入力いただいたメールアドレスに確認メールが送信されます。 メール内のリンクをクリックして、アカウントを有効化してください。
  - text: お名前
  - textbox "お名前"
  - text: メールアドレス
  - textbox "メールアドレス"
  - text: パスワード
  - textbox "パスワード"
  - text: パスワード（確認）
  - textbox "パスワード（確認）"
  - button "登録する"
  - paragraph:
    - text: すでにアカウントをお持ちの方は
    - link "ログイン":
      - /url: /login
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
   2 |
   3 | // テスト用のダミーユーザー情報 - Supabase Authに追加済みのユーザー
   4 | const TEST_USER = {
   5 |   email: 'test@example.com',
   6 |   password: 'password123',
   7 |   name: 'テストユーザー'
   8 | };
   9 |
   10 | test.describe('認証機能テスト', () => {
   11 |   test('新規登録フォームが正しく表示される', async ({ page }) => {
   12 |     // 新規登録ページに移動
   13 |     await page.goto('/signup');
   14 |     // ページが完全に読み込まれるまで待機
   15 |     await page.waitForLoadState('networkidle');
   16 |     
   17 |     // フォームが表示されていることを確認
   18 |     await expect(page.getByRole('heading', { name: /アカウント登録|新規登録|会員登録/i })).toBeVisible();
   19 |     await expect(page.getByLabel('お名前')).toBeVisible();
   20 |     await expect(page.getByLabel('メールアドレス')).toBeVisible();
>  21 |     await expect(page.getByLabel('パスワード')).toBeVisible();
      |                                            ^ Error: expect.toBeVisible: Error: strict mode violation: getByLabel('パスワード') resolved to 2 elements:
   22 |     
   23 |     // 登録ボタンが表示されていることを確認
   24 |     await expect(page.getByRole('button', { name: '登録' })).toBeVisible();
   25 |   });
   26 |   
   27 |   test('新規登録フォームのバリデーションが正しく動作する', async ({ page }) => {
   28 |     // 新規登録ページに移動
   29 |     await page.goto('/signup');
   30 |     
   31 |     // 空のフォームで登録を試みる
   32 |     await page.getByRole('button', { name: '登録' }).click();
   33 |     
   34 |     // フォームのバリデーションが動作することを確認
   35 |     await expect(page).toHaveURL('/signup');
   36 |     
   37 |     // 無効なメールアドレスでエラーが表示されることを確認
   38 |     await page.getByLabel('お名前').fill(TEST_USER.name);
   39 |     await page.getByLabel('メールアドレス').fill('invalid-email');
   40 |     await page.locator('#password').fill(TEST_USER.password);
   41 |     await page.getByRole('button', { name: '登録' }).click();
   42 |     
   43 |     // フォームが送信されないことを確認
   44 |     await expect(page).toHaveURL('/signup');
   45 |   });
   46 |
   47 |   test('ログインフォームが正しく表示される', async ({ page }) => {
   48 |     // ログインページに移動
   49 |     await page.goto('/login');
   50 |     // ページが完全に読み込まれるまで待機
   51 |     await page.waitForLoadState('networkidle');
   52 |     
   53 |     // フォームが表示されていることを確認
   54 |     await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
   55 |     await expect(page.getByLabel('メールアドレス')).toBeVisible();
   56 |     await expect(page.getByLabel('パスワード')).toBeVisible();
   57 |     
   58 |     // ログインボタンが表示されていることを確認
   59 |     await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
   60 |     
   61 |     // パスワードリセットリンクが表示されていることを確認
   62 |     await expect(page.getByText('パスワードをお忘れですか？')).toBeVisible();
   63 |   });
   64 |   
   65 |   test('ログインフォームのバリデーションが正しく動作する', async ({ page }) => {
   66 |     // ログインページに移動
   67 |     await page.goto('/login');
   68 |     
   69 |     // 空のフォームでログインを試みる
   70 |     await page.getByRole('button', { name: 'ログイン' }).click();
   71 |     
   72 |     // フォームのバリデーションが動作することを確認
   73 |     await expect(page).toHaveURL('/login');
   74 |     
   75 |     // 無効なメールアドレスでエラーが表示されることを確認
   76 |     await page.getByLabel('メールアドレス').fill('invalid-email');
   77 |     await page.locator('#password').fill('password123');
   78 |     await page.getByRole('button', { name: 'ログイン' }).click();
   79 |     
   80 |     // フォームが送信されないことを確認
   81 |     await expect(page).toHaveURL('/login');
   82 |   });
   83 |
   84 |   test('パスワードリセットリンクが正しく動作する', async ({ page }) => {
   85 |     // ログインページに移動
   86 |     await page.goto('/login');
   87 |     
   88 |     // パスワードリセットリンクをクリック
   89 |     await page.getByText('パスワードをお忘れですか？').click();
   90 |     
   91 |     // パスワードリセットページに遷移することを確認
   92 |     await expect(page).toHaveURL('/reset-password');
   93 |     
   94 |     // パスワードリセットフォームが表示されていることを確認
   95 |     await expect(page.getByText('パスワードをリセット')).toBeVisible();
   96 |     
   97 |     // メールアドレス入力欄が表示されていることを確認
   98 |     await expect(page.getByLabel('メールアドレス')).toBeVisible();
   99 |   });
  100 | });
  101 |
  102 | // ダッシュボードページのテスト（未認証状態）
  103 | test.describe('ダッシュボードページのテスト', () => {
  104 |   test('未認証ユーザーがダッシュボードにアクセスするとログインページにリダイレクトされる', async ({ page }) => {
  105 |     // ダッシュボードページに直接アクセス
  106 |     await page.goto('/dashboard');
  107 |     
  108 |     // ログインページにリダイレクトされることを確認
  109 |     await expect(page).toHaveURL(/\/login/);
  110 |   });
  111 | });
  112 |
  113 | // ログイン状態でのテスト
  114 | test.describe('認証済みユーザーのテスト', () => {
  115 |   // 各テストの前にログイン処理を実行
  116 |   test.beforeEach(async ({ page }) => {
  117 |     // テスト用のダミーユーザーを使用
  118 |     await page.goto('/login');
  119 |     // ページが完全に読み込まれるまで待機
  120 |     await page.waitForLoadState('networkidle');
  121 |     await page.getByLabel('メールアドレス').fill(TEST_USER.email);
```