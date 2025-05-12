# Test info

- Name: 認証済みユーザーのテスト >> ダッシュボードページが正しく表示される
- Location: /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/auth.spec.ts:129:7

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: getByText('ダッシュボード') resolved to 2 elements:
    1) <a href="/dashboard" class="px-3 py-2 text-sm rounded-md bg-primary/10 text-primary font-medium">ダッシュボード</a> aka locator('#main-content nav').getByText('ダッシュボード')
    2) <a href="/dashboard" class="px-3 py-2 text-xs text-center rounded-md bg-primary/10 text-primary font-medium">ダッシュボード</a> aka getByRole('link', { name: 'ダッシュボード' })

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByText('ダッシュボード')

    at /Users/akipinnote/Downloads/2025-05-11Simplesearch/piano-lesson-search/e2e/auth.spec.ts:133:45
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
  - paragraph: テスト教室
  - paragraph: 教室種別
  - paragraph: ピアノ・リトミック複合教室
  - paragraph: エリア
  - paragraph: テストエリア
  - paragraph: ウェブサイト
  - paragraph: http://example.com
  - paragraph: 問い合わせ用メールアドレス
  - paragraph: test-classroom@example.com
  - link "教室情報を編集":
    - /url: /dashboard/school
    - button "教室情報を編集"
  - link "公開設定を行う":
    - /url: /dashboard/subscription
    - button "公開設定を行う"
  - heading "統計情報" [level=2]
  - paragraph: 閲覧数
  - paragraph: "92"
  - paragraph: 過去30日間
  - paragraph: 問い合わせ数
  - paragraph: "5"
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
> 133 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
      |                                             ^ Error: expect.toBeVisible: Error: strict mode violation: getByText('ダッシュボード') resolved to 2 elements:
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