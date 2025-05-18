import { Builder, WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 指定されたブラウザのSelenium WebDriverを初期化する
 * @param browserName 'chrome'または'firefox'
 * @param options ブラウザ固有のオプション
 * @returns 設定済みのWebDriverインスタンス
 */
export async function setupDriver(
  browserName: 'chrome' | 'firefox' = 'chrome',
  options?: any
): Promise<WebDriver> {
  let driver: WebDriver;

  try {
    console.log(`${browserName}ドライバーを初期化しています...`);
    
    // デフォルトのオプションを設定
    if (!options) {
      if (browserName === 'chrome') {
        options = new ChromeOptions();
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-gpu');
        // ヘッドレスモードを無効化（デバッグのため画面表示）
        // options.addArguments('--headless');
        
        // ロギングの有効化
        options.setLoggingPrefs({ browser: 'ALL' });
      } else if (browserName === 'firefox') {
        options = new FirefoxOptions();
        // options.addArguments('--headless');
      }
    }

    const builder = new Builder().forBrowser(browserName);

    if (options) {
      if (browserName === 'chrome') {
        builder.setChromeOptions(options);
      } else if (browserName === 'firefox') {
        builder.setFirefoxOptions(options);
      }
    }

    // ドライバーの構築
    driver = await builder.build();
    
    // ウィンドウサイズの設定
    await driver.manage().window().setRect({ width: 1366, height: 768 });
    
    // スクリーンショット保存用ディレクトリ作成
    const screenshotDir = path.join(__dirname, '..', 'test-debug-output', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    console.log(`${browserName}ドライバーの初期化完了`);
    
    return driver;
  } catch (error) {
    console.error(`ドライバー初期化中にエラーが発生しました:`, error);
    throw error;
  }
} 