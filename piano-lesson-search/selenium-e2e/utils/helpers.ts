import { WebDriver } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';

export const logDebuggingInfo = async (driver: WebDriver, testName: string): Promise<void> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dirPath = path.join(__dirname, '..', 'test-debug-output', testName); // テスト名でサブディレクトリ作成
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const currentUrl = await driver.getCurrentUrl();
    const title = await driver.getTitle();
    const pageSource = await driver.getPageSource();
    const screenshot = await driver.takeScreenshot();

    fs.writeFileSync(path.join(dirPath, `info_${timestamp}.txt`),
      `URL: ${currentUrl}\nTitle: ${title}\n\nPage Source:\n${pageSource}`
    );
    fs.writeFileSync(path.join(dirPath, `screenshot_${timestamp}.png`), screenshot, 'base64');

    console.log(`[DEBUG] Debugging info for test "${testName}" saved to: ${dirPath}`);
  } catch (logError) {
    console.error('[DEBUG] Error saving debugging info:', logError);
  }
}; 