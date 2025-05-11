import { test, expect } from '@playwright/test';

// 検索機能と教室詳細ページのテスト
test.describe('検索機能のテスト', () => {
  test('検索ページが正しく表示される', async ({ page }) => {
    // 検索ページに移動
    await page.goto('/search');
    
    // 検索結果ページが表示されることを確認
    await expect(page.locator('h1')).toContainText('検索結果');
    
    // フィルターセクションが表示されていることを確認
    await expect(page.getByText('絞り込み', { exact: false })).toBeVisible();
  });
  
  test('キーワード検索が正しく表示される', async ({ page }) => {
    // キーワード付きで検索ページに移動
    await page.goto('/search?keyword1=ピアノ');
    
    // 検索キーワードが表示されることを確認
    await expect(page.getByText('ピアノ')).toBeVisible();
  });
  
  test('検索フィルターUIが正しく表示される', async ({ page }) => {
    // 検索ページに移動
    await page.goto('/search');
    
    // 教室種別フィルターが表示されていることを確認
    await expect(page.getByText('教室種別', { exact: false })).toBeVisible();
    
    // エリアフィルターが表示されていることを確認
    await expect(page.getByText('エリア', { exact: false })).toBeVisible();
  });

  test('検索結果のソートUIが正しく表示される', async ({ page }) => {
    // 検索ページに移動
    await page.goto('/search');
    
    // ソートオプションが表示されていることを確認
    await expect(page.getByText('並び替え', { exact: false })).toBeVisible();
  });

  test('検索結果が表示される', async ({ page }) => {
    // 検索ページに移動（一般的なキーワードで検索）
    await page.goto('/search?keyword1=ピアノ');
    
    // 検索結果が表示されるまで待機
    await page.waitForTimeout(1000);
    
    // 検索結果セクションが表示されることを確認
    await expect(page.locator('.md\\:col-span-3')).toBeVisible();
  });

});

test.describe('教室詳細ページのテスト', () => {
  test('教室詳細ページのURLが正しい形式である', async ({ page }) => {
    // 検索ページに移動
    await page.goto('/search?keyword1=ピアノ');
    
    // 検索結果が表示されるまで待機
    await page.waitForTimeout(2000);
    
    // 検索結果が存在するか確認
    const articles = page.locator('article');
    const count = await articles.count();
    
    if (count > 0) {
      // 詳細を見るリンクを探す
      const detailLink = page.getByRole('link', { name: '詳細を見る' }).first();
      
      if (await detailLink.isVisible()) {
        // リンクのURLを取得
        const href = await detailLink.getAttribute('href');
        
        // URLが/schools/で始まることを確認
        expect(href).toMatch(/^\/schools\//);
      }
    }
  });

  test('教室詳細ページのコンテンツ構造が正しい', async ({ page }) => {
    // 検索ページに移動
    await page.goto('/search?keyword1=ピアノ');
    
    // 検索結果が表示されるまで待機
    await page.waitForTimeout(2000);
    
    // 検索結果が存在するか確認
    const articles = page.locator('article');
    const count = await articles.count();
    
    if (count > 0) {
      // 詳細を見るリンクを探す
      const detailLink = page.getByRole('link', { name: '詳細を見る' }).first();
      
      if (await detailLink.isVisible()) {
        // 詳細ページに移動
        await detailLink.click();
        
        // ページが読み込まれるまで待機
        await page.waitForTimeout(2000);
        
        // ページの基本構造を確認
        await expect(page.locator('h1')).toBeVisible();
        
        // 教室情報セクションが存在することを確認
        await expect(page.getByText('教室情報', { exact: false })).toBeVisible();
      }
    }
  });
});
