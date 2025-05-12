# Test info

- Name: 教室情報を登録できること
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/stripe-payment-registration.spec.ts:29:5

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: getByText('保存しました')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for getByText('保存しました')

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/stripe-payment-registration.spec.ts:77:44
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
  - link "ピアノ・リトミック教室検索":
    - /url: /
  - button "ログアウト"
  - link "ダッシュボード":
    - /url: /dashboard
  - link "教室情報":
    - /url: /dashboard/school
  - link "お知らせ":
    - /url: /dashboard/announcement
  - link "写真管理":
    - /url: /dashboard/photos
  - link "統計情報":
    - /url: /dashboard/statistics
  - link "プロフィール":
    - /url: /dashboard/profile
  - link "サブスクリプション":
    - /url: /dashboard/subscription
  - heading "マイページ" [level=1]
  - heading "教室情報" [level=2]
  - text: 非公開
  - paragraph: 教室名
  - paragraph: テスト音楽教室
  - paragraph: 教室種別
  - paragraph: ピアノ・リトミック複合教室
  - paragraph: エリア
  - paragraph: 東京都渋谷区
  - paragraph: ウェブサイト
  - paragraph: https://example.com
  - paragraph: 問い合わせ用メールアドレス
  - paragraph: contact@example.com
  - link "教室情報を編集":
    - /url: /dashboard/school
    - button "教室情報を編集"
  - link "公開設定を行う":
    - /url: /dashboard/subscription
    - button "公開設定を行う"
  - heading "統計情報" [level=2]
  - paragraph: 閲覧数
  - paragraph: "39"
  - paragraph: 過去30日間
  - paragraph: 問い合わせ数
  - paragraph: "10"
  - paragraph: 過去30日間
  - paragraph: ※ 統計情報は参考値です。実際の値とは異なる場合があります。
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
   4 |  * 教室運営者向けE2Eテスト - 教室情報登録
   5 |  * 
   6 |  * このテストでは以下を検証します：
   7 |  * 1. ログインが正常に行えること
   8 |  * 2. 教室情報の登録が正常に行えること
   9 |  */
  10 |
  11 | // テスト用ユーザー情報
  12 | const TEST_USER = {
  13 |   email: 'test@example.com',
  14 |   password: 'password123',
  15 | };
  16 |
  17 | // テスト用教室情報
  18 | const TEST_SCHOOL = {
  19 |   name: 'テスト音楽教室',
  20 |   url: 'https://example.com',
  21 |   area: '東京都渋谷区',
  22 |   description: 'これはテスト用の音楽教室です。ピアノとリトミックのレッスンを提供しています。',
  23 |   contact_email: 'contact@example.com'
  24 | };
  25 |
  26 | /**
  27 |  * 教室情報登録テスト
  28 |  */
  29 | test('教室情報を登録できること', async ({ page }) => {
  30 |   console.log('教室情報登録テストを開始します');
  31 |   
  32 |   // ログイン
  33 |   await page.goto('/login');
  34 |   await page.waitForLoadState('networkidle');
  35 |   
  36 |   console.log('ページタイトル:', await page.title());
  37 |   
  38 |   // ログイン情報を入力
  39 |   await page.getByLabel('メールアドレス').fill(TEST_USER.email);
  40 |   await page.locator('#password').fill(TEST_USER.password);
  41 |   
  42 |   // ログインボタンをクリック
  43 |   await page.getByRole('button', { name: 'ログイン' }).click();
  44 |   
  45 |   // ダッシュボードページに遷移することを確認
  46 |   await expect(page).toHaveURL(/.*dashboard/);
  47 |   
  48 |   // 教室情報編集ページへ移動
  49 |   await page.goto('/dashboard/school');
  50 |   await page.waitForLoadState('networkidle');
  51 |   
  52 |   // 教室情報を入力
  53 |   // 教室種別を選択
  54 |   await page.getByRole('combobox').first().click();
  55 |   await page.getByRole('option').first().click();
  56 |   
  57 |   // 各フィールドに入力
  58 |   await page.locator('input[name="name"]').fill(TEST_SCHOOL.name);
  59 |   await page.locator('input[name="url"]').fill(TEST_SCHOOL.url);
  60 |   await page.locator('input[name="area"]').fill(TEST_SCHOOL.area);
  61 |   await page.locator('textarea[name="description"]').fill(TEST_SCHOOL.description);
  62 |   await page.locator('input[name="contact_email"]').fill(TEST_SCHOOL.contact_email);
  63 |   
  64 |   // コンソールエラーを監視
  65 |   const errors: string[] = [];
  66 |   page.on('console', msg => {
  67 |     if (msg.type() === 'error') {
  68 |       errors.push(`ブラウザコンソールエラー: ${msg.text()}`);
  69 |     }
  70 |   });
  71 |   
  72 |   // 保存ボタンをクリック
  73 |   await page.getByRole('button', { name: '保存' }).click();
  74 |   
  75 |   // 保存成功メッセージが表示されることを確認
  76 |   try {
> 77 |     await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 });
     |                                            ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  78 |     console.log('教室情報が正常に保存されました');
  79 |   } catch (e) {
  80 |     // エラーが発生した場合は詳細を出力
  81 |     console.error('教室情報の保存中にエラーが発生しました');
  82 |     console.error('検出されたコンソールエラー:', errors);
  83 |     
  84 |     // スクリーンショットを取得
  85 |     await page.screenshot({ path: 'error-school-registration.png' });
  86 |     
  87 |     // エラーを再スロー
  88 |     throw e;
  89 |   }
  90 | });
  91 |
```