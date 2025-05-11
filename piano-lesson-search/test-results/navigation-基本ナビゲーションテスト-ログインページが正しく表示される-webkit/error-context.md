# Test info

- Name: 基本ナビゲーションテスト >> ログインページが正しく表示される
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/navigation.spec.ts:34:7

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: getByRole('link', { name: '新規登録' }) resolved to 2 elements:
    1) <a href="/signup" class="px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary">新規登録</a> aka getByRole('navigation').getByRole('link', { name: '新規登録' })
    2) <a href="/signup" class="text-blue-600 dark:text-blue-400 hover:underline ml-1">新規登録</a> aka locator('#main-content').getByRole('link', { name: '新規登録' })

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByRole('link', { name: '新規登録' })

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/navigation.spec.ts:52:30
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
   2 |
   3 | test.describe('基本ナビゲーションテスト', () => {
   4 |   test('トップページが正しく表示される', async ({ page }) => {
   5 |     await page.goto('/');
   6 |     
   7 |     // タイトルが正しく表示されていることを確認
   8 |     await expect(page.locator('h1')).toContainText('ピアノ・リトミック教室を探す');
   9 |     
   10 |     // 検索フォームが表示されていることを確認
   11 |     await expect(page.locator('form')).toBeVisible();
   12 |     
   13 |     // 検索ボタンが表示されていることを確認
   14 |     const searchButton = page.getByRole('button', { name: '検索' });
   15 |     await expect(searchButton).toBeVisible();
   16 |   });
   17 |
   18 |   test('検索機能が正しく動作する', async ({ page }) => {
   19 |     await page.goto('/');
   20 |     
   21 |     // 検索キーワードを入力
   22 |     await page.getByPlaceholder('キーワードを入力').fill('ピアノ');
   23 |     
   24 |     // 検索ボタンをクリック
   25 |     await page.getByRole('button', { name: '検索' }).click();
   26 |     
   27 |     // 検索結果ページに遷移することを確認
   28 |     await expect(page).toHaveURL(/\/search\?/);
   29 |     
   30 |     // 検索結果が表示されることを確認（結果がなくても検索結果コンポーネントは表示される）
   31 |     await expect(page.locator('h1')).toContainText('検索結果');
   32 |   });
   33 |
   34 |   test('ログインページが正しく表示される', async ({ page }) => {
   35 |     await page.goto('/login');
   36 |     
   37 |     // ログインフォームが表示されていることを確認
   38 |     await expect(page.locator('h1')).toContainText('ログイン');
   39 |     
   40 |     // メールアドレス入力欄が表示されていることを確認
   41 |     await expect(page.getByLabel('メールアドレス')).toBeVisible();
   42 |     
   43 |     // パスワード入力欄が表示されていることを確認
   44 |     await expect(page.getByLabel('パスワード')).toBeVisible();
   45 |     
   46 |     // ログインボタンが表示されていることを確認
   47 |     const loginButton = page.getByRole('button', { name: 'ログイン' });
   48 |     await expect(loginButton).toBeVisible();
   49 |     
   50 |     // 新規登録リンクが表示されていることを確認
   51 |     const signupLink = page.getByRole('link', { name: '新規登録' });
>  52 |     await expect(signupLink).toBeVisible();
      |                              ^ Error: expect.toBeVisible: Error: strict mode violation: getByRole('link', { name: '新規登録' }) resolved to 2 elements:
   53 |   });
   54 |
   55 |   test('新規登録ページが正しく表示される', async ({ page }) => {
   56 |     await page.goto('/signup');
   57 |     
   58 |     // 新規登録フォームが表示されていることを確認
   59 |     await expect(page.locator('h1')).toContainText('新規登録');
   60 |     
   61 |     // お名前入力欄が表示されていることを確認
   62 |     await expect(page.getByLabel('お名前')).toBeVisible();
   63 |     
   64 |     // メールアドレス入力欄が表示されていることを確認
   65 |     await expect(page.getByLabel('メールアドレス')).toBeVisible();
   66 |     
   67 |     // パスワード入力欄が表示されていることを確認
   68 |     await expect(page.getByLabel('パスワード')).toBeVisible();
   69 |     
   70 |     // パスワード確認入力欄が表示されていることを確認
   71 |     await expect(page.getByLabel('パスワード（確認）')).toBeVisible();
   72 |     
   73 |     // 登録ボタンが表示されていることを確認
   74 |     const signupButton = page.getByRole('button', { name: '登録する' });
   75 |     await expect(signupButton).toBeVisible();
   76 |     
   77 |     // ログインリンクが表示されていることを確認
   78 |     const loginLink = page.getByRole('link', { name: 'ログイン' });
   79 |     await expect(loginLink).toBeVisible();
   80 |   });
   81 |
   82 |   test('フッターのリンクが正しく動作する', async ({ page }) => {
   83 |     await page.goto('/');
   84 |     
   85 |     // フッターが表示されていることを確認
   86 |     const footer = page.locator('footer');
   87 |     await expect(footer).toBeVisible();
   88 |     
   89 |     // ログインリンクが表示されていることを確認
   90 |     const loginLink = footer.getByRole('link', { name: 'ログイン' });
   91 |     await expect(loginLink).toBeVisible();
   92 |     
   93 |     // ログインリンクをクリック
   94 |     await loginLink.click();
   95 |     
   96 |     // ログインページに遷移することを確認
   97 |     await expect(page).toHaveURL('/login');
   98 |   });
   99 | });
  100 |
```