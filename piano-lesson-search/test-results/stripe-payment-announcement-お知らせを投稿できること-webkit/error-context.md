# Test info

- Name: お知らせを投稿できること
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/stripe-payment-announcement.spec.ts:26:5

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="title"]')

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/stripe-payment-announcement.spec.ts:62:45
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
    - link "マイページ":
      - /url: /dashboard
  - button:
    - img
- main:
  - heading "404" [level=1]
  - heading "This page could not be found." [level=2]
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
   3 | /**
   4 |  * 教室運営者向けE2Eテスト - お知らせ投稿
   5 |  * 
   6 |  * このテストでは以下を検証します：
   7 |  * 1. ログインが正常に行えること
   8 |  * 2. お知らせの投稿が正常に行えること
   9 |  */
   10 |
   11 | // テスト用ユーザー情報
   12 | const TEST_USER = {
   13 |   email: 'test@example.com',
   14 |   password: 'password123',
   15 | };
   16 |
   17 | // テスト用お知らせ情報
   18 | const TEST_ANNOUNCEMENT = {
   19 |   title: '新規生徒募集中',
   20 |   content: '5月より新規生徒を募集します。詳細はお問い合わせください。'
   21 | };
   22 |
   23 | /**
   24 |  * お知らせ投稿テスト
   25 |  */
   26 | test('お知らせを投稿できること', async ({ page }) => {
   27 |   console.log('お知らせ投稿テストを開始します');
   28 |   
   29 |   // ログイン
   30 |   await page.goto('/login');
   31 |   await page.waitForLoadState('networkidle');
   32 |   
   33 |   await page.getByLabel('メールアドレス').fill(TEST_USER.email);
   34 |   await page.locator('#password').fill(TEST_USER.password);
   35 |   
   36 |   // ログインボタンをクリック
   37 |   await page.getByRole('button', { name: 'ログイン' }).click();
   38 |   
   39 |   // ダッシュボードページに遷移することを確認
   40 |   await expect(page).toHaveURL(/.*dashboard/);
   41 |   
   42 |   // お知らせ管理ページへ移動
   43 |   await page.goto('/dashboard/announcements');
   44 |   await page.waitForLoadState('networkidle');
   45 |   
   46 |   // 新規お知らせ作成ボタンを探してクリック
   47 |   const newButton = page.getByRole('button', { name: /新規|作成|追加/ });
   48 |   if (await newButton.isVisible()) {
   49 |     await newButton.click();
   50 |     console.log('新規お知らせ作成ボタンをクリックしました');
   51 |   }
   52 |   
   53 |   // コンソールエラーを監視
   54 |   const errors: string[] = [];
   55 |   page.on('console', msg => {
   56 |     if (msg.type() === 'error') {
   57 |       errors.push(`ブラウザコンソールエラー: ${msg.text()}`);
   58 |     }
   59 |   });
   60 |   
   61 |   // お知らせ情報を入力
>  62 |   await page.locator('input[name="title"]').fill(TEST_ANNOUNCEMENT.title);
      |                                             ^ Error: locator.fill: Test timeout of 30000ms exceeded.
   63 |   await page.locator('textarea[name="content"]').fill(TEST_ANNOUNCEMENT.content);
   64 |   
   65 |   // 保存ボタンをクリック
   66 |   await page.getByRole('button', { name: /保存|登録/ }).click();
   67 |   
   68 |   try {
   69 |     // 保存成功メッセージが表示されることを確認
   70 |     await expect(page.getByText(/保存|成功|完了/)).toBeVisible({ timeout: 10000 });
   71 |     console.log('お知らせが正常に保存されました');
   72 |   } catch (e) {
   73 |     // エラーが発生した場合は詳細を出力
   74 |     console.error('お知らせの保存中にエラーが発生しました');
   75 |     console.error('検出されたコンソールエラー:', errors);
   76 |     
   77 |     // スクリーンショットを取得
   78 |     await page.screenshot({ path: 'error-announcement-creation.png' });
   79 |     
   80 |     // エラーを再スロー
   81 |     throw e;
   82 |   }
   83 | });
   84 |
   85 | /**
   86 |  * お知らせ一覧表示テスト
   87 |  */
   88 | test('お知らせ一覧が表示されること', async ({ page }) => {
   89 |   console.log('お知らせ一覧表示テストを開始します');
   90 |   
   91 |   // ログイン
   92 |   await page.goto('/login');
   93 |   await page.waitForLoadState('networkidle');
   94 |   
   95 |   await page.getByLabel('メールアドレス').fill(TEST_USER.email);
   96 |   await page.locator('#password').fill(TEST_USER.password);
   97 |   
   98 |   // ログインボタンをクリック
   99 |   await page.getByRole('button', { name: 'ログイン' }).click();
  100 |   
  101 |   // ダッシュボードページに遷移することを確認
  102 |   await expect(page).toHaveURL(/.*dashboard/);
  103 |   
  104 |   // お知らせ管理ページへ移動
  105 |   await page.goto('/dashboard/announcements');
  106 |   await page.waitForLoadState('networkidle');
  107 |   
  108 |   // お知らせ一覧が表示されていることを確認
  109 |   try {
  110 |     // テーブルまたはリスト要素が存在するか確認
  111 |     const listExists = await page.locator('table, ul, .announcement-list').isVisible();
  112 |     
  113 |     if (listExists) {
  114 |       console.log('お知らせ一覧が表示されています');
  115 |     } else {
  116 |       // お知らせがない場合は「お知らせがありません」などのメッセージが表示されるはず
  117 |       const emptyMessage = await page.getByText(/お知らせがありません|まだ投稿がありません|No announcements/).isVisible();
  118 |       
  119 |       if (emptyMessage) {
  120 |         console.log('お知らせがない状態が正しく表示されています');
  121 |       } else {
  122 |         throw new Error('お知らせ一覧またはお知らせなしメッセージが表示されていません');
  123 |       }
  124 |     }
  125 |   } catch (e) {
  126 |     console.error('お知らせ一覧の表示確認中にエラーが発生しました');
  127 |     await page.screenshot({ path: 'error-announcement-list.png' });
  128 |     throw e;
  129 |   }
  130 | });
  131 |
```