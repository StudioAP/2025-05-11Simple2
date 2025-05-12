# Test info

- Name: 認証機能テスト >> パスワードリセットリンクが正しく動作する
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/auth.spec.ts:84:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByText('パスワードをリセット')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByText('パスワードをリセット')

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/auth.spec.ts:95:48
```

# Page snapshot

```yaml
- link "メインコンテンツにスキップ":
  - /url: "#main-content"
- banner:
  - link "ピアノ・リトミック教室検索":
    - /url: /
  - navigation:
    - link "ホーム":
      - /url: /
    - link "ログイン":
      - /url: /login
    - link "新規登録":
      - /url: /signup
  - button:
    - img
- main:
  - heading "パスワードのリセット" [level=1]
  - paragraph: 登録したメールアドレスを入力してください
  - text: メールアドレス
  - textbox "メールアドレス"
  - button "パスワードリセットメールを送信"
  - paragraph:
    - link "ログインページに戻る":
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
   21 |     await expect(page.getByLabel('パスワード')).toBeVisible();
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
>  95 |     await expect(page.getByText('パスワードをリセット')).toBeVisible();
      |                                                ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
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
  122 |     await page.locator('#password').fill(TEST_USER.password);
  123 |     await page.getByRole('button', { name: 'ログイン' }).click();
  124 |     
  125 |     // ログイン後、ダッシュボードにリダイレクトされることを期待
  126 |     await expect(page).toHaveURL('/dashboard');
  127 |   });
  128 |
  129 |   test('ダッシュボードページが正しく表示される', async ({ page }) => {
  130 |     await page.goto('/dashboard');
  131 |     
  132 |     // ダッシュボードのナビゲーションが表示されていることを確認
  133 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
  134 |     await expect(page.getByText('教室情報')).toBeVisible();
  135 |     await expect(page.getByText('お知らせ')).toBeVisible();
  136 |     await expect(page.getByText('写真管理')).toBeVisible();
  137 |     await expect(page.getByText('統計情報')).toBeVisible();
  138 |     await expect(page.getByText('プロフィール')).toBeVisible();
  139 |     await expect(page.getByText('サブスクリプション')).toBeVisible();
  140 |     
  141 |     // ログアウトボタンが表示されていることを確認
  142 |     await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible();
  143 |   });
  144 |
  145 |   test('ログアウト機能が正しく動作する', async ({ page }) => {
  146 |     await page.goto('/dashboard');
  147 |     
  148 |     // ログアウトボタンをクリック
  149 |     await page.getByRole('button', { name: 'ログアウト' }).click();
  150 |     
  151 |     // トップページにリダイレクトされることを確認
  152 |     await expect(page).toHaveURL('/');
  153 |   });
  154 | });
  155 |
```