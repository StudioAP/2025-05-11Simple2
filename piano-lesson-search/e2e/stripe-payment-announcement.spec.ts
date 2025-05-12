import { test, expect } from '@playwright/test';

/**
 * 教室運営者向けE2Eテスト - お知らせ投稿
 * 
 * このテストでは以下を検証します：
 * 1. ログインが正常に行えること
 * 2. お知らせの投稿が正常に行えること
 */

// テスト用ユーザー情報
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

// テスト用お知らせ情報
const TEST_ANNOUNCEMENT = {
  title: '新規生徒募集中',
  content: '5月より新規生徒を募集します。詳細はお問い合わせください。'
};

/**
 * お知らせ投稿テスト
 */
test('お知らせを投稿できること', async ({ page }) => {
  console.log('お知らせ投稿テストを開始します');
  
  // ログイン
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.getByLabel('メールアドレス').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  
  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // ダッシュボードページに遷移することを確認
  await expect(page).toHaveURL(/.*dashboard/);
  
  // お知らせ管理ページへ移動
  await page.goto('/dashboard/announcements');
  await page.waitForLoadState('networkidle');
  
  // 新規お知らせ作成ボタンを探してクリック
  const newButton = page.getByRole('button', { name: /新規|作成|追加/ });
  if (await newButton.isVisible()) {
    await newButton.click();
    console.log('新規お知らせ作成ボタンをクリックしました');
  }
  
  // コンソールエラーを監視
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`ブラウザコンソールエラー: ${msg.text()}`);
    }
  });
  
  // お知らせ情報を入力
  await page.locator('input[name="title"]').fill(TEST_ANNOUNCEMENT.title);
  await page.locator('textarea[name="content"]').fill(TEST_ANNOUNCEMENT.content);
  
  // 保存ボタンをクリック
  await page.getByRole('button', { name: /保存|登録/ }).click();
  
  try {
    // 保存成功メッセージが表示されることを確認
    await expect(page.getByText(/保存|成功|完了/)).toBeVisible({ timeout: 10000 });
    console.log('お知らせが正常に保存されました');
  } catch (e) {
    // エラーが発生した場合は詳細を出力
    console.error('お知らせの保存中にエラーが発生しました');
    console.error('検出されたコンソールエラー:', errors);
    
    // スクリーンショットを取得
    await page.screenshot({ path: 'error-announcement-creation.png' });
    
    // エラーを再スロー
    throw e;
  }
});

/**
 * お知らせ一覧表示テスト
 */
test('お知らせ一覧が表示されること', async ({ page }) => {
  console.log('お知らせ一覧表示テストを開始します');
  
  // ログイン
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.getByLabel('メールアドレス').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  
  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // ダッシュボードページに遷移することを確認
  await expect(page).toHaveURL(/.*dashboard/);
  
  // お知らせ管理ページへ移動
  await page.goto('/dashboard/announcements');
  await page.waitForLoadState('networkidle');
  
  // お知らせ一覧が表示されていることを確認
  try {
    // テーブルまたはリスト要素が存在するか確認
    const listExists = await page.locator('table, ul, .announcement-list').isVisible();
    
    if (listExists) {
      console.log('お知らせ一覧が表示されています');
    } else {
      // お知らせがない場合は「お知らせがありません」などのメッセージが表示されるはず
      const emptyMessage = await page.getByText(/お知らせがありません|まだ投稿がありません|No announcements/).isVisible();
      
      if (emptyMessage) {
        console.log('お知らせがない状態が正しく表示されています');
      } else {
        throw new Error('お知らせ一覧またはお知らせなしメッセージが表示されていません');
      }
    }
  } catch (e) {
    console.error('お知らせ一覧の表示確認中にエラーが発生しました');
    await page.screenshot({ path: 'error-announcement-list.png' });
    throw e;
  }
});
