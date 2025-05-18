import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import * as path from 'path';

/**
 * 指定されたブラウザのSelenium WebDriverを初期化する
 * @param browserName 'chrome'または'firefox'
 * @param options ブラウザ固有のオプション
 * @returns 設定済みのWebDriverインスタンス
 */
export async function setupDriver(
  browserName: 'chrome' | 'firefox' = 'chrome',
  options?: any
) {
  let driver;

  try {
    const builder = new Builder().forBrowser(browserName);

    if (options) {
      if (browserName === 'chrome') {
        builder.setChromeOptions(options);
      } else if (browserName === 'firefox') {
        builder.setFirefoxOptions(options);
      }
    }

    driver = await builder.build();
    
    // ウィンドウサイズの設定
    await driver.manage().window().setRect({ width: 1366, height: 768 });
    
    console.log(`${browserName}ドライバーの初期化完了`);
    
    return driver;
  } catch (error) {
    console.error(`ドライバー初期化中にエラーが発生しました:`, error);
    throw error;
  }
} 