# Test info

- Name: 基本ナビゲーションテスト >> 検索フォームが正しく動作する
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/navigation.spec.ts:20:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /\/search\?keyword1=\u30d4\u30a2\u30ce/
Received string:  "http://localhost:3000/search?keyword1=%E3%83%94%E3%82%A2%E3%83%8E"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    2 × locator resolved to <html lang="ja" class="__className_5cfdac light">…</html>
      - unexpected value "http://localhost:3000/"
    7 × locator resolved to <html lang="ja" class="__className_5cfdac light">…</html>
      - unexpected value "http://localhost:3000/search?keyword1=%E3%83%94%E3%82%A2%E3%83%8E"

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/navigation.spec.ts:36:24
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
  - heading "検索結果" [level=1]
  - heading "検索キーワード" [level=2]
  - text: ピアノ
  - heading "教室タイプ" [level=3]
  - checkbox "ピアノ教室"
  - text: ピアノ教室
  - checkbox "リトミック教室"
  - text: リトミック教室
  - checkbox "ピアノ・リトミック複合教室"
  - text: ピアノ・リトミック複合教室
  - heading "エリア" [level=3]
  - heading "並び替え" [level=3]
  - combobox: 関連度順
  - button "フィルターを適用"
  - button "リセット"
  - paragraph: 検索条件に一致する教室が見つかりませんでした。
  - paragraph: 別のキーワードで検索するか、フィルターを変更してみてください。
  - link "トップページに戻る":
    - /url: /
    - button "トップページに戻る"
  - link "フィルターをリセット":
    - /url: /search
    - button "フィルターをリセット"
- button "アクセシビリティメニューを開く":
  - img
- contentinfo:
  - paragraph: © 2025 ピアノ・リトミック教室検索 All rights reserved.
  - paragraph:
    - text: Powered by
    - link "Supabase":
      - /url: https://supabase.com
- alert: ピアノの検索結果 | ピアノ・リトミック教室検索
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
>  36 |     await expect(page).toHaveURL(/\/search\?keyword1=\u30d4\u30a2\u30ce/);
      |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
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
   87 |     await expect(page.getByLabel('パスワード')).toBeVisible();
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