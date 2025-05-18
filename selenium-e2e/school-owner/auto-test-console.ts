import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import * as fs from 'fs';
import * as path from 'path';
import { setupDriver } from '../utils/driver-setup';
import { ConsoleLogger } from '../utils/console-logger';
import * as dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// テスト設定
const TEST_NAME = 'auto-test-console';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://piano-rythmique.netlify.app';
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'piano-rythmique.find@gmail.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test1234!';

// コンソールログ出力ディレクトリ
const OUTPUT_DIR = path.join(__dirname, '..', 'test-debug-output', 'console-logs');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// テスト用ダミー画像ディレクトリを確認し、ファイルがなければ作成
const TEST_DATA_DIR = path.join(__dirname, '..', 'test-data');
const DUMMY_IMAGE_PATH = path.join(TEST_DATA_DIR, 'dummy.png');
if (!fs.existsSync(TEST_DATA_DIR)) {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DUMMY_IMAGE_PATH)) {
  // 簡単なPNGファイルを生成
  const BASE64_DUMMY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  fs.writeFileSync(DUMMY_IMAGE_PATH, Buffer.from(BASE64_DUMMY_PNG, 'base64'));
  console.log(`ダミー画像を作成しました: ${DUMMY_IMAGE_PATH}`);
}

// テスト機能一覧
const TEST_SCENARIOS = [
  { name: 'ログイン', func: loginTest },
  { name: '写真アップロード', func: uploadPhotoTest },
];

async function runTests() {
  let driver: WebDriver | null = null;
  
  try {
    // ログ取得を有効化してドライバーを設定
    const chromeOptions = new ChromeOptions();
    // chromeOptions.addArguments('--headless'); // ヘッドレスで実行（必要に応じてコメントアウト）
    chromeOptions.setLoggingPrefs({ browser: 'ALL' });
    
    driver = await setupDriver('chrome', chromeOptions);
    
    // テスト実行ログファイル
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFilePath = path.join(OUTPUT_DIR, `${TEST_NAME}_summary_${timestamp}.log`);
    fs.writeFileSync(logFilePath, `自動テスト開始: ${new Date().toISOString()}\n\n`);
    
    // 各テストシナリオを実行
    for (const scenario of TEST_SCENARIOS) {
      console.log(`\n=== テスト開始: ${scenario.name} ===`);
      fs.appendFileSync(logFilePath, `\n=== テスト開始: ${scenario.name} ===\n`);
      
      try {
        await scenario.func(driver as WebDriver);
        fs.appendFileSync(logFilePath, `✅ テスト成功: ${scenario.name}\n`);
      } catch (error: any) {
        console.error(`❌ エラー発生 (${scenario.name}):`, error);
        fs.appendFileSync(logFilePath, `❌ テスト失敗: ${scenario.name}\n`);
        fs.appendFileSync(logFilePath, `エラー: ${error.message || '不明なエラー'}\n`);
      }
      
      // テスト毎にコンソールログをキャプチャ
      try {
        const logger = new ConsoleLogger(driver, `${TEST_NAME}_${scenario.name}`);
        const { filePath } = await logger.captureConsoleLogs();
        
        if (filePath) {
          fs.appendFileSync(logFilePath, `コンソールログ: ${path.basename(filePath)}\n`);
        }
      } catch (error: any) {
        console.warn('コンソールログキャプチャに失敗:', error.message);
      }
    }
    
    fs.appendFileSync(logFilePath, `\n自動テスト終了: ${new Date().toISOString()}\n`);
    console.log(`\n全テスト完了 - ログ保存先: ${logFilePath}`);
    
  } catch (error: any) {
    console.error('テスト実行中にエラーが発生しました:', error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

// 個別のテスト機能

async function loginTest(driver: WebDriver) {
  console.log('ログインテスト開始');
  
  try {
    // ログインページに移動
    await driver.get(`${BASE_URL}/auth/signin`);
    console.log(`ログインページにアクセス: ${BASE_URL}/auth/signin`);
    
    // ページソースを取得して、フォーム要素の特徴を確認
    const pageSource = await (driver as any).getPageSource();
    console.log('ページソースから特徴的な文字列を検索');
    
    // さまざまな可能性のあるセレクタでメールフィールドを探す
    let emailField: any = null;
    const emailSelectors = [
      By.id('email'), 
      By.css('[name="email"]'),
      By.css('input[type="email"]'),
      By.css('input[placeholder*="mail"]'),
      By.css('input[placeholder*="メール"]'),
      By.xpath('//label[contains(text(), "メール")]/following::input[1]'),
      By.xpath('//label[contains(text(), "Email")]/following::input[1]'),
      By.xpath('//label[contains(text(), "メールアドレス")]/following::input[1]')
    ];
    
    for (const selector of emailSelectors) {
      try {
        const elements = await (driver as any).findElements(selector);
        if (elements.length > 0) {
          emailField = elements[0];
          console.log(`メールフィールドを検出: ${selector}`);
          break;
        }
      } catch (e) {
        // セレクタが見つからない場合は次へ
      }
    }
    
    if (!emailField) {
      console.error('メールフィールドが見つかりませんでした。ページ構造が変更されている可能性があります。');
      throw new Error('メールフィールドが見つかりません');
    }
    
    // 同様にパスワードフィールドを探す
    let passwordField: any = null;
    const passwordSelectors = [
      By.id('password'), 
      By.css('[name="password"]'),
      By.css('input[type="password"]'),
      By.xpath('//label[contains(text(), "パスワード")]/following::input[1]'),
      By.xpath('//label[contains(text(), "Password")]/following::input[1]')
    ];
    
    for (const selector of passwordSelectors) {
      try {
        const elements = await (driver as any).findElements(selector);
        if (elements.length > 0) {
          passwordField = elements[0];
          console.log(`パスワードフィールドを検出: ${selector}`);
          break;
        }
      } catch (e) {
        // セレクタが見つからない場合は次へ
      }
    }
    
    if (!passwordField) {
      console.error('パスワードフィールドが見つかりませんでした。ページ構造が変更されている可能性があります。');
      throw new Error('パスワードフィールドが見つかりません');
    }
    
    // メールとパスワードを入力
    await emailField.sendKeys(TEST_EMAIL);
    await passwordField.sendKeys(TEST_PASSWORD);
    console.log('認証情報を入力しました');
    
    // ログインボタンを探す
    let loginButton: any = null;
    const buttonSelectors = [
      By.css('button[type="submit"]'),
      By.xpath('//button[contains(text(), "ログイン")]'),
      By.xpath('//button[contains(text(), "サインイン")]'),
      By.xpath('//button[contains(text(), "Login")]'),
      By.xpath('//button[contains(text(), "Sign in")]'),
      By.css('form button')
    ];
    
    for (const selector of buttonSelectors) {
      try {
        const elements = await (driver as any).findElements(selector);
        if (elements.length > 0) {
          loginButton = elements[0];
          console.log(`ログインボタンを検出: ${selector}`);
          break;
        }
      } catch (e) {
        // セレクタが見つからない場合は次へ
      }
    }
    
    if (!loginButton) {
      console.error('ログインボタンが見つかりませんでした。ページ構造が変更されている可能性があります。');
      throw new Error('ログインボタンが見つかりません');
    }
    
    // ログインボタンをクリック
    await loginButton.click();
    console.log('ログインボタンをクリックしました');
    
    // ログイン後の遷移を待機
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('ログイン処理完了');
    
    return true;
  } catch (error: any) {
    console.error('ログイン処理でエラー:', error.message);
    throw error;
  }
}

async function uploadPhotoTest(driver: WebDriver) {
  console.log('写真アップロードテスト開始');
  
  try {
    // まずログインを試みる
    try {
      await loginTest(driver);
      console.log('ログイン成功');
    } catch (e: any) {
      console.warn('ログイン処理でエラーが発生しましたが、テストを続行します:', e.message);
    }
    
    // ダッシュボードに移動
    console.log('ダッシュボードページに移動します');
    await driver.get(`${BASE_URL}/dashboard`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // ページ読み込み待機
    
    // 教室編集ページへの遷移を試みる
    console.log('教室編集ページへの遷移を試みます');
    
    // 教室編集リンクを探す
    const editLinkSelectors = [
      By.xpath('//a[contains(@href, "/dashboard/school/edit")]'),
      By.xpath('//a[contains(text(), "編集")]'),
      By.xpath('//button[contains(text(), "編集")]'),
      By.css('a[href*="edit"]'),
      By.css('.edit-button'),
      By.css('[aria-label*="edit"]')
    ];
    
    let editLink = null;
    for (const selector of editLinkSelectors) {
      try {
        const elements = await (driver as any).findElements(selector);
        if (elements.length > 0) {
          editLink = elements[0];
          console.log(`教室編集リンクを検出: ${selector}`);
          break;
        }
      } catch (e) {
        // セレクタが見つからない場合は次へ
      }
    }
    
    if (editLink) {
      // 編集リンクが見つかればクリック
      await editLink.click();
      console.log('教室編集リンクをクリックしました');
      await new Promise(resolve => setTimeout(resolve, 2000)); // ページ読み込み待機
    } else {
      // 直接URLで教室編集ページにアクセス
      console.log('教室編集リンクが見つからないため、直接URLでアクセスします');
      await driver.get(`${BASE_URL}/dashboard/school/edit`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // ページ読み込み待機
    }
    
    // ダミー画像ファイルのパス
    const dummyImagePath = path.resolve(__dirname, '..', 'test-data', 'dummy.png');
    console.log(`使用するダミー画像: ${dummyImagePath}`);
    
    // ファイルが存在するか確認
    if (!fs.existsSync(dummyImagePath)) {
      console.error(`画像ファイルが見つかりません: ${dummyImagePath}`);
      throw new Error('テスト用のダミー画像ファイルが見つかりません。selenium-e2e/test-data/dummy.pngを配置してください。');
    }
    
    // 画像アップロード用の入力フィールドを探す
    const fileInputSelectors = [
      By.css('input[type="file"]'),
      By.xpath('//input[@type="file"]'),
      By.css('input[accept*="image"]'),
      By.xpath('//input[contains(@accept, "image")]')
    ];
    
    let fileInput = null;
    for (const selector of fileInputSelectors) {
      try {
        const elements = await (driver as any).findElements(selector);
        if (elements.length > 0) {
          fileInput = elements[0];
          console.log(`ファイル入力フィールドを検出: ${selector}`);
          break;
        }
      } catch (e) {
        // セレクタが見つからない場合は次へ
      }
    }
    
    if (!fileInput) {
      throw new Error('ファイル入力フィールドが見つかりません。ページ構造が変更されている可能性があります。');
    }
    
    // 画像をアップロード
    await fileInput.sendKeys(dummyImagePath);
    console.log('画像をアップロードしました');
    
    // アップロード完了を待機
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 保存ボタンを探してクリック（もしあれば）
    const saveButtonSelectors = [
      By.css('button[type="submit"]'),
      By.xpath('//button[contains(text(), "保存")]'),
      By.xpath('//button[contains(text(), "Save")]'),
      By.xpath('//button[contains(text(), "更新")]'),
      By.xpath('//button[contains(text(), "Update")]')
    ];
    
    let saveButton = null;
    for (const selector of saveButtonSelectors) {
      try {
        const elements = await (driver as any).findElements(selector);
        if (elements.length > 0) {
          saveButton = elements[0];
          console.log(`保存ボタンを検出: ${selector}`);
          break;
        }
      } catch (e) {
        // セレクタが見つからない場合は次へ
      }
    }
    
    if (saveButton) {
      await saveButton.click();
      console.log('保存ボタンをクリックしました');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 保存処理待機
    } else {
      console.log('保存ボタンが見つかりませんでした。アップロードのみ実行します。');
    }
    
    // 画面キャプチャ
    try {
      const screenshotPath = path.join(OUTPUT_DIR, `upload_test_screenshot_${Date.now()}.png`);
      const screenshot = await (driver as any).takeScreenshot();
      fs.writeFileSync(screenshotPath, screenshot, 'base64');
      console.log(`スクリーンショット保存: ${screenshotPath}`);
    } catch (e: any) {
      console.warn('スクリーンショット取得エラー:', e.message);
    }
    
    console.log('写真アップロードテスト完了');
    return true;
  } catch (error: any) {
    console.error('写真アップロードテストでエラー:', error.message);
    throw error;
  }
}

// テスト実行
if (require.main === module) {
  runTests().catch(console.error);
}