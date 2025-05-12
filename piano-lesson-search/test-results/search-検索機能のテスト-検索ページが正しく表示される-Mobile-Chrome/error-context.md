# Test info

- Name: 検索機能のテスト >> 検索ページが正しく表示される
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/search.spec.ts:5:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByText('絞り込み')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByText('絞り込み')

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/search.spec.ts:15:60
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
  - paragraph: キーワードが指定されていません
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
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // 検索機能と教室詳細ページのテスト
   4 | test.describe('検索機能のテスト', () => {
   5 |   test('検索ページが正しく表示される', async ({ page }) => {
   6 |     // 検索ページに移動
   7 |     await page.goto('/search');
   8 |     // ページが完全に読み込まれるまで待機
   9 |     await page.waitForLoadState('networkidle');
   10 |     
   11 |     // 検索結果ページが表示されることを確認
   12 |     await expect(page.getByRole('heading', { level: 1 })).toContainText('検索結果');
   13 |     
   14 |     // フィルターセクションが表示されていることを確認
>  15 |     await expect(page.getByText('絞り込み', { exact: false })).toBeVisible();
      |                                                            ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   16 |   });
   17 |   
   18 |   test('キーワード検索が正しく表示される', async ({ page }) => {
   19 |     // キーワード付きで検索ページに移動
   20 |     await page.goto('/search?keyword1=ピアノ');
   21 |     // ページが完全に読み込まれるまで待機
   22 |     await page.waitForLoadState('networkidle');
   23 |     
   24 |     // 検索キーワードが表示されることを確認
   25 |     await expect(page.getByText('ピアノ', { exact: false })).toBeVisible();
   26 |   });
   27 |   
   28 |   test('検索フィルターUIが正しく表示される', async ({ page }) => {
   29 |     // 検索ページに移動
   30 |     await page.goto('/search');
   31 |     // ページが完全に読み込まれるまで待機
   32 |     await page.waitForLoadState('networkidle');
   33 |     
   34 |     // 教室種別フィルターが表示されていることを確認
   35 |     await expect(page.getByText('教室種別', { exact: false })).toBeVisible();
   36 |     
   37 |     // エリアフィルターが表示されていることを確認
   38 |     await expect(page.getByText('エリア', { exact: false })).toBeVisible();
   39 |   });
   40 |
   41 |   test('検索結果のソートUIが正しく表示される', async ({ page }) => {
   42 |     // 検索ページに移動
   43 |     await page.goto('/search');
   44 |     // ページが完全に読み込まれるまで待機
   45 |     await page.waitForLoadState('networkidle');
   46 |     
   47 |     // ソートオプションが表示されていることを確認
   48 |     await expect(page.getByText('並び替え', { exact: false })).toBeVisible();
   49 |   });
   50 |
   51 |   test('検索結果が表示される', async ({ page }) => {
   52 |     // 検索ページに移動（一般的なキーワードで検索）
   53 |     await page.goto('/search?keyword1=ピアノ');
   54 |     // ページが完全に読み込まれるまで待機
   55 |     await page.waitForLoadState('networkidle');
   56 |     
   57 |     // 検索結果セクションが表示されることを確認
   58 |     await expect(page.locator('main').locator('article').first()).toBeVisible();
   59 |   });
   60 |
   61 | });
   62 |
   63 | test.describe('教室詳細ページのテスト', () => {
   64 |   test('教室詳細ページのURLが正しい形式である', async ({ page }) => {
   65 |     // 検索ページに移動
   66 |     await page.goto('/search?keyword1=ピアノ');
   67 |     
   68 |     // 検索結果が表示されるまで待機
   69 |     await page.waitForTimeout(2000);
   70 |     
   71 |     // 検索結果が存在するか確認
   72 |     const articles = page.locator('article');
   73 |     const count = await articles.count();
   74 |     
   75 |     if (count > 0) {
   76 |       // 詳細を見るリンクを探す
   77 |       const detailLink = page.getByRole('link', { name: '詳細を見る' }).first();
   78 |       
   79 |       if (await detailLink.isVisible()) {
   80 |         // リンクのURLを取得
   81 |         const href = await detailLink.getAttribute('href');
   82 |         
   83 |         // URLが/schools/で始まることを確認
   84 |         expect(href).toMatch(/^\/schools\//);
   85 |       }
   86 |     }
   87 |   });
   88 |
   89 |   test('教室詳細ページのコンテンツ構造が正しい', async ({ page }) => {
   90 |     // 検索ページに移動
   91 |     await page.goto('/search?keyword1=ピアノ');
   92 |     
   93 |     // 検索結果が表示されるまで待機
   94 |     await page.waitForTimeout(2000);
   95 |     
   96 |     // 検索結果が存在するか確認
   97 |     const articles = page.locator('article');
   98 |     const count = await articles.count();
   99 |     
  100 |     if (count > 0) {
  101 |       // 詳細を見るリンクを探す
  102 |       const detailLink = page.getByRole('link', { name: '詳細を見る' }).first();
  103 |       
  104 |       if (await detailLink.isVisible()) {
  105 |         // 詳細ページに移動
  106 |         await detailLink.click();
  107 |         
  108 |         // ページが読み込まれるまで待機
  109 |         await page.waitForLoadState('networkidle');
  110 |         
  111 |         // ページの基本構造を確認
  112 |         await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  113 |         
  114 |         // 教室情報セクションが存在することを確認
  115 |         await expect(page.getByText('教室情報', { exact: false })).toBeVisible();
```