# Test info

- Name: 基本ナビゲーションテスト >> トップページが正しく表示される
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/navigation.spec.ts:4:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)

Locator: locator('h1')
Expected string: "ピアノ・リトミック教室を探す"
Received string: "ピアノ・リトミック教室検索"
Call log:
  - expect.toContainText with timeout 5000ms
  - waiting for locator('h1')
    9 × locator resolved to <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl mb-4">…</h1>
      - unexpected value "ピアノ・リトミック教室検索"

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/navigation.spec.ts:8:38
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
  - main:
    - heading "ピアノ・リトミック教室検索" [level=1]
    - paragraph: お近くのピアノ教室・リトミック教室を簡単に検索できます。 キーワードを入力して、あなたにぴったりの教室を見つけましょう。
    - heading "教室を検索" [level=2]
    - text: "キーワード 1:"
    - textbox "検索キーワード 1"
    - text: "キーワード 2:"
    - textbox "検索キーワード 2"
    - text: "キーワード 3:"
    - textbox "検索キーワード 3"
    - button "検索する"
    - paragraph: ※ 最大3つのキーワードで検索できます。キーワードを複数入力すると、すべてに一致する教室が検索されます。
    - heading "簡単検索" [level=3]
    - paragraph: キーワードを入力するだけで、あなたの条件に合った教室が見つかります。
    - heading "豊富な情報" [level=3]
    - paragraph: 教室の詳細情報や写真を確認して、安心して問い合わせができます。
    - heading "直接問い合わせ" [level=3]
    - paragraph: 気になる教室には、サイト内のフォームから直接問い合わせができます。
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
>  8 |     await expect(page.locator('h1')).toContainText('ピアノ・リトミック教室を探す');
     |                                      ^ Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)
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
   52 |     await expect(signupLink).toBeVisible();
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