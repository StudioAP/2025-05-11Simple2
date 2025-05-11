import { test, expect } from '@playwright/test';

// テスト用のダミーユーザー情報 - テスト実行ごとに一意のメールアドレスを使用
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Password123!',
  name: 'テストユーザー'
};

test.describe('認証機能テスト', () => {
  test('新規登録フォームが正しく表示される', async ({ page }) => {
    // 新規登録ページに移動
    await page.goto('/signup');
    
    // フォームが表示されていることを確認
    await expect(page.getByText('アカウント登録')).toBeVisible();
    await expect(page.getByLabel('お名前')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    
    // 登録ボタンが表示されていることを確認
    await expect(page.getByRole('button', { name: '登録' })).toBeVisible();
  });
  
  test('新規登録フォームのバリデーションが正しく動作する', async ({ page }) => {
    // 新規登録ページに移動
    await page.goto('/signup');
    
    // 空のフォームで登録を試みる
    await page.getByRole('button', { name: '登録' }).click();
    
    // フォームのバリデーションが動作することを確認
    await expect(page).toHaveURL('/signup');
    
    // 無効なメールアドレスでエラーが表示されることを確認
    await page.getByLabel('お名前').fill(TEST_USER.name);
    await page.getByLabel('メールアドレス').fill('invalid-email');
    await page.getByLabel('パスワード').fill(TEST_USER.password);
    await page.getByRole('button', { name: '登録' }).click();
    
    // フォームが送信されないことを確認
    await expect(page).toHaveURL('/signup');
  });

  test('ログインフォームが正しく表示される', async ({ page }) => {
    // ログインページに移動
    await page.goto('/login');
    
    // フォームが表示されていることを確認
    await expect(page.getByText('ログイン')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    
    // ログインボタンが表示されていることを確認
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    // パスワードリセットリンクが表示されていることを確認
    await expect(page.getByText('パスワードをお忘れですか？')).toBeVisible();
  });
  
  test('ログインフォームのバリデーションが正しく動作する', async ({ page }) => {
    // ログインページに移動
    await page.goto('/login');
    
    // 空のフォームでログインを試みる
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // フォームのバリデーションが動作することを確認
    await expect(page).toHaveURL('/login');
    
    // 無効なメールアドレスでエラーが表示されることを確認
    await page.getByLabel('メールアドレス').fill('invalid-email');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // フォームが送信されないことを確認
    await expect(page).toHaveURL('/login');
  });

  test('パスワードリセットリンクが正しく動作する', async ({ page }) => {
    // ログインページに移動
    await page.goto('/login');
    
    // パスワードリセットリンクをクリック
    await page.getByText('パスワードをお忘れですか？').click();
    
    // パスワードリセットページに遷移することを確認
    await expect(page).toHaveURL('/reset-password');
    
    // パスワードリセットフォームが表示されていることを確認
    await expect(page.getByText('パスワードをリセット')).toBeVisible();
    
    // メールアドレス入力欄が表示されていることを確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
  });
});

// ダッシュボードページのテスト（未認証状態）
test.describe('ダッシュボードページのテスト', () => {
  test('未認証ユーザーがダッシュボードにアクセスするとログインページにリダイレクトされる', async ({ page }) => {
    // ダッシュボードページに直接アクセス
    await page.goto('/dashboard');
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login/);
  });
});

// ログイン状態でのテスト
test.describe('認証済みユーザーのテスト', () => {
  // 各テストの前にログイン処理を実行
  test.beforeEach(async ({ page }) => {
    // テスト用のダミーユーザーを使用
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill(TEST_USER.email);
    await page.getByLabel('パスワード').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ログイン後、ダッシュボードにリダイレクトされることを期待
    await expect(page).toHaveURL('/dashboard');
  });

  test('ダッシュボードページが正しく表示される', async ({ page }) => {
    await page.goto('/dashboard');
    
    // ダッシュボードのナビゲーションが表示されていることを確認
    await expect(page.getByText('ダッシュボード')).toBeVisible();
    await expect(page.getByText('教室情報')).toBeVisible();
    await expect(page.getByText('お知らせ')).toBeVisible();
    await expect(page.getByText('写真管理')).toBeVisible();
    await expect(page.getByText('統計情報')).toBeVisible();
    await expect(page.getByText('プロフィール')).toBeVisible();
    await expect(page.getByText('サブスクリプション')).toBeVisible();
    
    // ログアウトボタンが表示されていることを確認
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible();
  });

  test('ログアウト機能が正しく動作する', async ({ page }) => {
    await page.goto('/dashboard');
    
    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();
    
    // トップページにリダイレクトされることを確認
    await expect(page).toHaveURL('/');
  });
});
