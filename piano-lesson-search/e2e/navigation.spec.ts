import { test, expect } from '@playwright/test';

test.describe('基本ナビゲーションテスト', () => {
  test('トップページが正しく表示される', async ({ page }) => {
    await page.goto('/');
    
    // タイトルが正しく表示されていることを確認
    await expect(page.locator('h1')).toContainText('ピアノ・リトミック教室を探す');
    
    // 検索フォームが表示されていることを確認
    await expect(page.locator('form')).toBeVisible();
    
    // 検索ボタンが表示されていることを確認
    const searchButton = page.getByRole('button', { name: '検索' });
    await expect(searchButton).toBeVisible();
  });

  test('検索フォームが正しく動作する', async ({ page }) => {
    await page.goto('/');
    
    // 検索キーワードを入力
    const keywordInput = page.getByPlaceholder('キーワードを入力');
    await expect(keywordInput).toBeVisible();
    await keywordInput.fill('ピアノ');
    
    // 検索ボタンをクリック
    const searchButton = page.getByRole('button', { name: '検索' });
    await expect(searchButton).toBeVisible();
    await searchButton.click();
    
    // 検索結果ページに遷移することを確認
    await expect(page).toHaveURL(/\/search\?keyword1=\u30d4\u30a2\u30ce/);
    
    // 検索結果ページが表示されることを確認
    await expect(page.locator('h1')).toContainText('検索結果');
    
    // 検索キーワードが表示されることを確認
    await expect(page.getByText('ピアノ')).toBeVisible();
  });

  test('ログインページが正しく表示される', async ({ page }) => {
    await page.goto('/login');
    
    // ログインフォームが表示されていることを確認
    await expect(page.locator('h1')).toContainText('ログイン');
    
    // メールアドレス入力欄が表示されていることを確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    
    // パスワード入力欄が表示されていることを確認
    await expect(page.getByLabel('パスワード')).toBeVisible();
    
    // ログインボタンが表示されていることを確認
    const loginButton = page.getByRole('button', { name: 'ログイン' });
    await expect(loginButton).toBeVisible();
    
    // 新規登録リンクが表示されていることを確認
    const signupLink = page.getByRole('link', { name: '新規登録' });
    await expect(signupLink).toBeVisible();
  });

  test('新規登録ページが正しく表示される', async ({ page }) => {
    await page.goto('/signup');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');
    
    // 新規登録フォームが表示されていることを確認
    await expect(page.getByText('アカウント登録', { exact: false })).toBeVisible();
    
    // お名前入力欄が表示されていることを確認
    await expect(page.getByLabel('お名前')).toBeVisible();
    
    // メールアドレス入力欄が表示されていることを確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    
    // パスワード入力欄が表示されていることを確認
    await expect(page.getByLabel('パスワード')).toBeVisible();
    
    // 登録ボタンが表示されていることを確認
    const signupButton = page.getByRole('button', { name: '登録' });
    await expect(signupButton).toBeVisible();
    
    // ログインリンクが表示されていることを確認
    const loginLink = page.getByText('ログイン', { exact: false });
    await expect(loginLink).toBeVisible();
  });

  test('フッターが正しく表示される', async ({ page }) => {
    await page.goto('/');
    
    // フッターが表示されていることを確認
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // 著作権表示が表示されていることを確認
    const copyright = footer.getByText('©', { exact: false });
    await expect(copyright).toBeVisible();
    
    // Supabaseへのリンクが表示されていることを確認
    const supabaseLink = footer.getByText('Supabase');
    await expect(supabaseLink).toBeVisible();
  });
  
  test('ヘッダーのナビゲーションが正しく表示される', async ({ page }) => {
    await page.goto('/');
    
    // ヘッダーが表示されていることを確認
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // ロゴが表示されていることを確認
    const logo = header.getByText('ピアノ・リトミック教室検索', { exact: false });
    await expect(logo).toBeVisible();
    
    // ログインリンクが表示されていることを確認
    const loginLink = header.getByText('ログイン', { exact: false });
    await expect(loginLink).toBeVisible();
  });
});
