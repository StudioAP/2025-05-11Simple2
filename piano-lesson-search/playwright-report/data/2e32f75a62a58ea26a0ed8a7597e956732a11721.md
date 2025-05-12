# Test info

- Name: 基本ナビゲーションテスト >> 新規登録ページが正しく表示される
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/navigation.spec.ts:71:7

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: getByLabel('パスワード') resolved to 2 elements:
    1) <input value="" required="" id="password" type="password" name="password" placeholder="8文字以上" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"/> aka getByRole('textbox', { name: 'パスワード', exact: true })
    2) <input value="" required="" type="password" id="confirmPassword" name="confirmPassword" placeholder="パスワードを再入力" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"/> aka getByRole('textbox', { name: 'パスワード（確認）' })

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByLabel('パスワード')

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/navigation.spec.ts:87:44
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
   3 | test.describe('基本ナビゲーションテスト', () => {
   4 |   test('トップページが正しく表示される', async ({ page }) => {
   5 |     await page.goto('/');
   6 |     // ページが完全に読み込まれるまで待機
   7 |     await page.waitForLoadState('networkidle');
   8 |     
   9 |     // タイトルが正しく表示されていることを確認
   10 |     await expect(page.getByRole('heading', { level: 1 })).toContainText('ピアノ・リトミック教室を探す');
   11 |     
   12 |     // 検索フォームが表示されていることを確認
   13 |     await expect(page.locator('form')).toBeVisible();
   14 |     
   15 |     // 検索ボタンが表示されていることを確認
   16 |     const searchButton = page.getByRole('button', { name: '検索' });
   17 |     await expect(searchButton).toBeVisible();
   18 |   });
   19 |
   20 |   test('検索フォームが正しく動作する', async ({ page }) => {
   21 |     await page.goto('/');
   22 |     // ページが完全に読み込まれるまで待機
   23 |     await page.waitForLoadState('networkidle');
   24 |     
   25 |     // 検索キーワードを入力
   26 |     const keywordInput = page.getByRole('textbox').first();
   27 |     await expect(keywordInput).toBeVisible();
   28 |     await keywordInput.fill('ピアノ');
   29 |     
   30 |     // 検索ボタンをクリック
   31 |     const searchButton = page.getByRole('button', { name: '検索' });
   32 |     await expect(searchButton).toBeVisible();
   33 |     await searchButton.click();
   34 |     
   35 |     // 検索結果ページに遷移することを確認
   36 |     await expect(page).toHaveURL(/\/search\?keyword1=\u30d4\u30a2\u30ce/);
   37 |     
   38 |     // ページ遷移後にページが読み込まれるまで待機
   39 |     await page.waitForLoadState('networkidle');
   40 |     
   41 |     // 検索結果ページが表示されることを確認
   42 |     await expect(page.getByRole('heading', { level: 1 })).toContainText('検索結果');
   43 |     
   44 |     // 検索キーワードが表示されることを確認
   45 |     await expect(page.getByText('ピアノ')).toBeVisible();
   46 |   });
   47 |
   48 |   test('ログインページが正しく表示される', async ({ page }) => {
   49 |     await page.goto('/login');
   50 |     // ページが完全に読み込まれるまで待機
   51 |     await page.waitForLoadState('networkidle');
   52 |     
   53 |     // ログインフォームが表示されていることを確認
   54 |     await expect(page.getByRole('heading', { level: 1 })).toContainText('ログイン');
   55 |     
   56 |     // メールアドレス入力欄が表示されていることを確認
   57 |     await expect(page.getByLabel('メールアドレス')).toBeVisible();
   58 |     
   59 |     // パスワード入力欄が表示されていることを確認
   60 |     await expect(page.getByLabel('パスワード')).toBeVisible();
   61 |     
   62 |     // ログインボタンが表示されていることを確認
   63 |     const loginButton = page.getByRole('button', { name: 'ログイン' });
   64 |     await expect(loginButton).toBeVisible();
   65 |     
   66 |     // 新規登録リンクが表示されていることを確認
   67 |     const signupLink = page.getByRole('link', { name: '新規登録' });
   68 |     await expect(signupLink).toBeVisible();
   69 |   });
   70 |
   71 |   test('新規登録ページが正しく表示される', async ({ page }) => {
   72 |     await page.goto('/signup');
   73 |     
   74 |     // ページが読み込まれるまで待機
   75 |     await page.waitForLoadState('domcontentloaded');
   76 |     
   77 |     // 新規登録フォームが表示されていることを確認
   78 |     await expect(page.getByRole('heading', { name: /アカウント登録|新規登録|会員登録/i })).toBeVisible();
   79 |     
   80 |     // お名前入力欄が表示されていることを確認
   81 |     await expect(page.getByLabel('お名前')).toBeVisible();
   82 |     
   83 |     // メールアドレス入力欄が表示されていることを確認
   84 |     await expect(page.getByLabel('メールアドレス')).toBeVisible();
   85 |     
   86 |     // パスワード入力欄が表示されていることを確認
>  87 |     await expect(page.getByLabel('パスワード')).toBeVisible();
      |                                            ^ Error: expect.toBeVisible: Error: strict mode violation: getByLabel('パスワード') resolved to 2 elements:
   88 |     
   89 |     // 登録ボタンが表示されていることを確認
   90 |     const signupButton = page.getByRole('button', { name: '登録' });
   91 |     await expect(signupButton).toBeVisible();
   92 |     
   93 |     // ログインリンクが表示されていることを確認
   94 |     const loginLink = page.getByText('ログイン', { exact: false });
   95 |     await expect(loginLink).toBeVisible();
   96 |   });
   97 |
   98 |   test('フッターが正しく表示される', async ({ page }) => {
   99 |     await page.goto('/');
  100 |     // ページが完全に読み込まれるまで待機
  101 |     await page.waitForLoadState('networkidle');
  102 |     
  103 |     // フッターが表示されていることを確認
  104 |     const footer = page.locator('footer');
  105 |     await expect(footer).toBeVisible();
  106 |     
  107 |     // 著作権表示が表示されていることを確認
  108 |     const copyright = footer.getByText('©', { exact: false });
  109 |     await expect(copyright).toBeVisible();
  110 |     
  111 |     // Supabaseへのリンクが表示されていることを確認
  112 |     const supabaseLink = footer.getByText('Supabase');
  113 |     await expect(supabaseLink).toBeVisible();
  114 |   });
  115 |   
  116 |   test('ヘッダーのナビゲーションが正しく表示される', async ({ page }) => {
  117 |     await page.goto('/');
  118 |     // ページが完全に読み込まれるまで待機
  119 |     await page.waitForLoadState('networkidle');
  120 |     
  121 |     // ヘッダーが表示されていることを確認
  122 |     const header = page.locator('header');
  123 |     await expect(header).toBeVisible();
  124 |     
  125 |     // ロゴが表示されていることを確認
  126 |     const logo = header.getByText('ピアノ・リトミック教室検索', { exact: false });
  127 |     await expect(logo).toBeVisible();
  128 |     
  129 |     // ログインリンクが表示されていることを確認
  130 |     const loginLink = header.getByText('ログイン', { exact: false });
  131 |     await expect(loginLink).toBeVisible();
  132 |   });
  133 | });
  134 |
```