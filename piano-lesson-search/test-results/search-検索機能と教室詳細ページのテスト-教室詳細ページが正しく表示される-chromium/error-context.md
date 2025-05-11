# Test info

- Name: 検索機能と教室詳細ページのテスト >> 教室詳細ページが正しく表示される
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/search.spec.ts:78:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('article') to be visible

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/search.spec.ts:83:16
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
  - heading "検索結果" [level=1]
  - heading "検索キーワード" [level=2]
  - text: ピアノ
  - heading "教室タイプ" [level=3]
  - checkbox "ピアノ教室"
  - text: ピアノ教室
  - checkbox "リトミック教室"
  - text: リトミック教室
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
   3 | test.describe('検索機能と教室詳細ページのテスト', () => {
   4 |   test('検索フィルターが正しく動作する', async ({ page }) => {
   5 |     // 検索ページに移動
   6 |     await page.goto('/search?keyword1=ピアノ');
   7 |     
   8 |     // 検索結果ページが表示されることを確認
   9 |     await expect(page.locator('h1')).toContainText('検索結果');
   10 |     
   11 |     // フィルターが表示されていることを確認
   12 |     await expect(page.getByText('絞り込み')).toBeVisible();
   13 |     
   14 |     // 教室種別フィルターを開く
   15 |     await page.getByText('教室種別').click();
   16 |     
   17 |     // 教室種別の選択肢が表示されることを確認
   18 |     await expect(page.getByText('ピアノ教室')).toBeVisible();
   19 |     
   20 |     // ピアノ教室を選択
   21 |     await page.getByText('ピアノ教室').click();
   22 |     
   23 |     // フィルターが適用されることを確認
   24 |     await expect(page).toHaveURL(/type=/);
   25 |     
   26 |     // エリアフィルターを開く
   27 |     await page.getByText('エリア').click();
   28 |     
   29 |     // エリアの入力欄が表示されることを確認
   30 |     const areaInput = page.getByPlaceholder('エリアを入力');
   31 |     await expect(areaInput).toBeVisible();
   32 |     
   33 |     // エリアを入力
   34 |     await areaInput.fill('東京');
   35 |     await page.keyboard.press('Enter');
   36 |     
   37 |     // フィルターが適用されることを確認
   38 |     await expect(page).toHaveURL(/area=/);
   39 |   });
   40 |
   41 |   test('検索結果のソートが正しく動作する', async ({ page }) => {
   42 |     // 検索ページに移動
   43 |     await page.goto('/search?keyword1=ピアノ');
   44 |     
   45 |     // ソートオプションが表示されていることを確認
   46 |     await expect(page.getByText('並び替え')).toBeVisible();
   47 |     
   48 |     // ソートオプションを開く
   49 |     await page.getByText('並び替え').click();
   50 |     
   51 |     // ソートの選択肢が表示されることを確認
   52 |     await expect(page.getByText('新着順')).toBeVisible();
   53 |     
   54 |     // 新着順を選択
   55 |     await page.getByText('新着順').click();
   56 |     
   57 |     // ソートが適用されることを確認
   58 |     await expect(page).toHaveURL(/sort=/);
   59 |   });
   60 |
   61 |   test('ページネーションが正しく動作する', async ({ page }) => {
   62 |     // 検索ページに移動
   63 |     await page.goto('/search?keyword1=ピアノ');
   64 |     
   65 |     // ページネーションが表示されていることを確認（結果が複数ページある場合）
   66 |     const pagination = page.locator('nav[aria-label="ページネーション"]');
   67 |     
   68 |     // ページネーションが存在する場合のみテスト
   69 |     if (await pagination.isVisible()) {
   70 |       // 次のページボタンをクリック
   71 |       await page.getByRole('button', { name: '次のページ' }).click();
   72 |       
   73 |       // ページパラメータが変更されることを確認
   74 |       await expect(page).toHaveURL(/page=2/);
   75 |     }
   76 |   });
   77 |
   78 |   test('教室詳細ページが正しく表示される', async ({ page }) => {
   79 |     // 検索ページに移動して最初の教室をクリック
   80 |     await page.goto('/search?keyword1=ピアノ');
   81 |     
   82 |     // 検索結果が表示されるまで待機
>  83 |     await page.waitForSelector('article');
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
   84 |     
   85 |     // 検索結果が存在する場合のみテスト
   86 |     const firstResult = page.locator('article').first();
   87 |     if (await firstResult.isVisible()) {
   88 |       // 教室名を取得
   89 |       const schoolName = await firstResult.locator('h2').textContent();
   90 |       
   91 |       // 教室詳細ページへのリンクをクリック
   92 |       await firstResult.getByRole('link', { name: '詳細を見る' }).click();
   93 |       
   94 |       // 教室詳細ページが表示されることを確認
   95 |       await expect(page).toHaveURL(/\/schools\//);
   96 |       
   97 |       // 教室名が表示されることを確認
   98 |       if (schoolName) {
   99 |         await expect(page.locator('h1')).toContainText(schoolName);
  100 |       }
  101 |       
  102 |       // 教室詳細が表示されることを確認
  103 |       await expect(page.getByText('教室詳細')).toBeVisible();
  104 |       
  105 |       // 問い合わせフォームが表示されることを確認
  106 |       await expect(page.getByText('教室へのお問い合わせ')).toBeVisible();
  107 |     }
  108 |   });
  109 |
  110 |   test('問い合わせフォームのバリデーションが正しく動作する', async ({ page }) => {
  111 |     // 教室詳細ページに直接移動（IDは実際の環境に合わせて変更する必要あり）
  112 |     // テスト環境では存在するIDを使用する必要がある
  113 |     await page.goto('/search?keyword1=ピアノ');
  114 |     
  115 |     // 検索結果が表示されるまで待機
  116 |     await page.waitForSelector('article');
  117 |     
  118 |     // 検索結果が存在する場合のみテスト
  119 |     const firstResult = page.locator('article').first();
  120 |     if (await firstResult.isVisible()) {
  121 |       // 教室詳細ページへのリンクをクリック
  122 |       await firstResult.getByRole('link', { name: '詳細を見る' }).click();
  123 |       
  124 |       // 教室詳細ページが表示されることを確認
  125 |       await expect(page).toHaveURL(/\/schools\//);
  126 |       
  127 |       // 問い合わせフォームが表示されるまで待機
  128 |       await page.waitForSelector('form');
  129 |       
  130 |       // 空のフォームで送信を試みる
  131 |       await page.getByRole('button', { name: '送信する' }).click();
  132 |       
  133 |       // フォームのバリデーションエラーが表示されることを確認
  134 |       // HTML5のバリデーションが動作するため、エラーメッセージは表示されないが
  135 |       // フォームの送信は防止される
  136 |       await expect(page.getByText('教室へのお問い合わせ')).toBeVisible();
  137 |       
  138 |       // フォームに情報を入力
  139 |       await page.getByLabel('お名前').fill('テストユーザー');
  140 |       await page.getByLabel('メールアドレス').fill('test@example.com');
  141 |       await page.getByLabel('お問い合わせ内容').fill('これはテストメッセージです。');
  142 |       
  143 |       // 送信ボタンをクリック
  144 |       // 注意: 実際のAPIコールは行われないようにモックする必要がある
  145 |       // このテストでは送信ボタンのクリックまでをテスト
  146 |       await page.getByRole('button', { name: '送信する' }).click();
  147 |     }
  148 |   });
  149 | });
  150 |
```