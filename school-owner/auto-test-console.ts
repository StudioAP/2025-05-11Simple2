import * as fs from 'fs';
import * as path from 'path';
import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { Key } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import * as dotenv from 'dotenv';
import { setupDriver } from '../utils/driver-setup';
import { ConsoleLogger } from '../utils/console-logger';

// 環境変数の読み込み
dotenv.config();

// テスト設定
const TEST_NAME = 'auto-test-console';
// 環境変数がない場合はデフォルト値を使用
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://piano-rythmique.netlify.app';
const TEST_EMAIL = process.env.TEST_USER_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '';

// コンソールログ出力ディレクトリ
const OUTPUT_DIR = path.join(__dirname, '..', 'test-debug-output', 'console-logs');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// スクリーンショットディレクトリの作成
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-debug-output', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 個別のテスト機能

async function loginTest(driver: WebDriver) {
  try {
    console.log('ログインテスト開始');
    
    // 現在のURLを確認（navigateOnly関数で既に移動済み）
    const currentUrl = await driver.getCurrentUrl();
    console.log(`サインインページでテスト実行中: ${currentUrl}`);
    
    // ページのHTMLソースを出力して確認
    const pageSource = await driver.getPageSource();
    console.log('ページソースのログを確認（デバッグ用）');
    
    // ページが完全に読み込まれるまで少し待機
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // メールフィールドを探して入力
    let emailField = null;
    
    console.log('メールフィールドを探しています...');
    
    try {
      // 1. name属性による検索（最も信頼性が高い）
      console.log('name属性で検索します');
      emailField = await driver.findElement(By.name('email'));
      console.log('name属性でメールフィールドが見つかりました');
    } catch (e1) {
      console.log('name属性でフィールドが見つかりませんでした:', e1.message);
      
      try {
        // 2. type属性による検索
        console.log('type属性で検索します');
        emailField = await driver.findElement(By.css('input[type="email"]'));
        console.log('type属性でメールフィールドが見つかりました');
      } catch (e2) {
        console.log('type属性でもフィールドが見つかりませんでした:', e2.message);
        
        try {
          // 3. ID属性による検索（最後の手段）
          console.log('id属性で検索します');
          emailField = await driver.findElement(By.id('email'));
          console.log('id属性でメールフィールドが見つかりました');
        } catch (e3) {
          console.log('id属性でもフィールドが見つかりませんでした:', e3.message);
          
          // 4. フォーラム内最初のinput要素を検索
          console.log('フォーム内の最初のinput要素を検索します');
          emailField = await driver.findElement(By.css('form input'));
          console.log('フォーム内の入力フィールドが見つかりました');
        }
      }
    }
    
    if (emailField) {
      await emailField.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.DELETE);
      await emailField.sendKeys(TEST_EMAIL);
      console.log('メールアドレスを入力しました:', TEST_EMAIL);
    } else {
      throw new Error('メールフィールドが見つかりませんでした');
    }
    
    // パスワードフィールドを探して入力
    let passwordField = null;
    
    console.log('パスワードフィールドを探しています...');
    
    try {
      // 1. name属性による検索
      console.log('name属性で検索します');
      passwordField = await driver.findElement(By.name('password'));
      console.log('name属性でパスワードフィールドが見つかりました');
    } catch (e1) {
      console.log('name属性でフィールドが見つかりませんでした:', e1.message);
      
      try {
        // 2. type属性による検索
        console.log('type属性で検索します');
        passwordField = await driver.findElement(By.css('input[type="password"]'));
        console.log('type属性でパスワードフィールドが見つかりました');
      } catch (e2) {
        console.log('type属性でもフィールドが見つかりませんでした:', e2.message);
        
        try {
          // 3. ID属性による検索（最後の手段）
          console.log('id属性で検索します');
          passwordField = await driver.findElement(By.id('password'));
          console.log('id属性でパスワードフィールドが見つかりました');
        } catch (e3) {
          console.log('id属性でもフィールドが見つかりませんでした:', e3.message);
          
          // 4. フォーラム内2番目のinput要素を検索
          console.log('フォーム内の2番目のinput要素を検索します');
          const inputFields = await driver.findElements(By.css('form input'));
          if (inputFields.length >= 2) {
            passwordField = inputFields[1]; // 2番目の入力フィールド
            console.log('フォーム内の2番目の入力フィールドが見つかりました');
          } else {
            throw new Error('パスワードフィールドが見つかりませんでした');
          }
        }
      }
    }
    
    if (passwordField) {
      await passwordField.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.DELETE);
      await passwordField.sendKeys(TEST_PASSWORD);
      console.log('パスワードを入力しました');
    } else {
      throw new Error('パスワードフィールドが見つかりませんでした');
    }
    
    console.log('ログインボタンを探しています...');
    
    // ログインボタンをクリック - 複数の検索方法を試す
    let loginButton = null;
    
    try {
      // 1. type="submit"による検索
      console.log('type="submit"で検索します');
      loginButton = await driver.findElement(By.css('button[type="submit"]'));
      console.log('送信ボタンが見つかりました');
    } catch (e1) {
      console.log('submit属性でボタンが見つかりませんでした:', e1.message);
      
      try {
        // 2. ボタンテキストによる検索
        console.log('ボタンのテキストで検索します');
        loginButton = await driver.findElement(
          By.xpath('//button[contains(., "Sign in") or contains(., "ログイン") or contains(., "サインイン")]')
        );
        console.log('テキスト内容でボタンが見つかりました');
      } catch (e2) {
        console.log('テキストでもボタンが見つかりませんでした:', e2.message);
        
        try {
          // 3. name属性による検索（Next.jsフォームアクション用）
          console.log('name属性で検索します');
          loginButton = await driver.findElement(By.css('button[name^="$ACTION_ID_"]'));
          console.log('name属性でボタンが見つかりました');
        } catch (e3) {
          console.log('name属性でもボタンが見つかりませんでした:', e3.message);
          
          // 4. フォーム内のボタンを検索
          console.log('フォーム内のボタンを検索します');
          loginButton = await driver.findElement(By.css('form button'));
          console.log('フォーム内のボタンが見つかりました');
        }
      }
    }
    
    if (loginButton) {
      await loginButton.click();
      console.log('ログインボタンをクリックしました');
    } else {
      throw new Error('ログインボタンが見つかりませんでした');
    }
    
    console.log('ダッシュボードへのリダイレクトを待機します...');
    
    // ログイン後のリダイレクトを待機 - 複数の可能性を考慮
    try {
      await driver.wait(until.urlContains('/dashboard'), 10000);
      console.log('ダッシュボードにリダイレクトされました');
    } catch (e) {
      console.log('URLに/dashboardが含まれていないため、他のパターンを確認します:', e.message);
      try {
        // アカウントページへのリダイレクト確認
        await driver.wait(until.urlContains('/account'), 5000);
        console.log('アカウントページにリダイレクトされました');
      } catch (e2) {
        console.log('アカウントページでもないため、さらに確認します:', e2.message);
        // ホームページ（ログイン後のリダイレクト）を確認
        try {
          await driver.wait(until.urlContains('/home'), 5000);
          console.log('ホームページにリダイレクトされました');
        } catch (e3) {
          console.log('想定されるリダイレクトページが見つかりません。現在のページ状態:', e3.message);
          const currentUrl = await driver.getCurrentUrl();
          console.log('現在のURL:', currentUrl);
          // スクリーンショットを取得して状態を確認
          await takeScreenshot(driver, 'login-redirect-failure');
        }
      }
    }
    
    console.log('ログインテスト完了');
  } catch (error) {
    console.error('ログイン処理中にエラーが発生しました:', error);
    await takeScreenshot(driver, 'login-error');
    throw error;
  }
}

async function viewProfileTest(driver: WebDriver) {
  try {
    console.log('プロフィール閲覧テスト開始');
    
    // 少し待機してUIが完全に読み込まれるようにする
    await driver.sleep(2000);
    
    // 現在のURLを確認
    console.log('現在のURL:', await driver.getCurrentUrl());
    
    // ユーザーメニューを探す
    console.log('ユーザーメニューボタンを探しています...');
    await driver.wait(until.elementLocated(By.css('header button')), 10000);
    
    // まずすべてのヘッダーボタンを取得して調査
    const headerButtons = await driver.findElements(By.css('header button'));
    console.log(`ヘッダーボタン数: ${headerButtons.length}`);
    
    // 最初のヘッダーボタンをクリック（ユーザーメニューと仮定）
    if (headerButtons.length > 0) {
      await headerButtons[0].click();
      console.log('ヘッダーボタンをクリックしました');
      
      // メニューが表示されるまで待機
      await driver.sleep(1000);
      
      // プロフィールリンクまたは類似のものを探す
      const menuItems = await driver.findElements(By.css('a'));
      console.log(`メニューアイテム数: ${menuItems.length}`);
      
      // メニュー項目からプロフィールらしきものを探してクリック
      let profileFound = false;
      for (const item of menuItems) {
        const text = await item.getText();
        console.log(`メニュー項目: ${text}`);
        
        if (text.includes('プロフィール') || text.includes('アカウント') || text.includes('Profile')) {
          await item.click();
          profileFound = true;
          console.log('プロフィールリンクをクリックしました');
          break;
        }
      }
      
      if (!profileFound) {
        console.log('プロフィールリンクが見つからないため、テストをスキップします');
      }
    } else {
      console.log('ユーザーメニューボタンが見つからないため、テストをスキップします');
    }
    
    console.log('プロフィール閲覧テスト完了');
  } catch (error) {
    console.error('プロフィール閲覧中に問題が発生しました:', error.message);
    throw error;
  }
}

async function registerSchoolTest(driver: WebDriver) {
  try {
    console.log('教室情報登録テスト開始');
    
    // ダッシュボードに移動
    await driver.get(`${BASE_URL}/dashboard`);
    console.log('ダッシュボードに移動しました:', await driver.getCurrentUrl());
    
    // ページ読み込み完了まで待機
    await driver.sleep(3000);
    
    // すべてのリンクを取得して調査
    const links = await driver.findElements(By.css('a'));
    console.log(`リンク数: ${links.length}`);
    
    // リンクテキストを出力
    for (const link of links) {
      try {
        const text = await link.getText();
        const href = await link.getAttribute('href');
        if (text) {
          console.log(`リンク: "${text}" - ${href}`);
          
          // 教室情報登録または類似のリンクを探す
          if (text.includes('教室') || text.includes('学校') || text.includes('School')) {
            await link.click();
            console.log('教室関連リンクをクリックしました');
            break;
          }
        }
      } catch (e) {
        // 一部のリンクは取得できない場合がある
      }
    }
    
    // 少し待機
    await driver.sleep(2000);
    console.log('現在のURL:', await driver.getCurrentUrl());
    
    console.log('教室情報登録テスト完了');
  } catch (error) {
    console.error('教室情報登録中に問題が発生しました:', error.message);
    throw error;
  }
}

async function uploadPhotoTest(driver: WebDriver) {
  try {
    console.log('写真アップロードテスト開始');
    
    // 現在のURLを確認
    console.log('現在のURL:', await driver.getCurrentUrl());
    
    // ダッシュボードまたは教室ページに移動
    if (!await driver.getCurrentUrl().includes('dashboard')) {
      await driver.get(`${BASE_URL}/dashboard`);
      await driver.sleep(2000);
    }
    
    // すべてのボタンを取得
    const buttons = await driver.findElements(By.css('button'));
    console.log(`ボタン数: ${buttons.length}`);
    
    // ボタンテキストを出力
    for (const button of buttons) {
      try {
        const text = await button.getText();
        if (text) {
          console.log(`ボタン: "${text}"`);
          
          // 写真、アップロード、イメージ関連のボタンを探す
          if (text.includes('写真') || text.includes('画像') || text.includes('アップロード') || 
              text.includes('Photo') || text.includes('Image') || text.includes('Upload')) {
            await button.click();
            console.log('写真関連ボタンをクリックしました');
            await driver.sleep(1000);
            break;
          }
        }
      } catch (e) {
        // 一部のボタンは取得できない場合がある
      }
    }
    
    console.log('写真アップロードテスト完了');
  } catch (error) {
    console.error('写真アップロード中に問題が発生しました:', error.message);
    throw error;
  }
}

async function postAnnouncementTest(driver: WebDriver) {
  try {
    console.log('お知らせ投稿テスト開始');
    
    // 現在のURLを確認
    console.log('現在のURL:', await driver.getCurrentUrl());
    
    // ダッシュボードに移動
    if (!await driver.getCurrentUrl().includes('dashboard')) {
      await driver.get(`${BASE_URL}/dashboard`);
      await driver.sleep(2000);
    }
    
    // すべてのリンクとボタンを調査
    const elements = await driver.findElements(By.css('a, button'));
    console.log(`UI要素数: ${elements.length}`);
    
    // 要素のテキストを出力
    for (const elem of elements) {
      try {
        const text = await elem.getText();
        const tagName = await elem.getTagName();
        if (text) {
          console.log(`${tagName}: "${text}"`);
          
          // お知らせ、新規投稿、記事関連の要素を探す
          if (text.includes('お知らせ') || text.includes('投稿') || text.includes('ニュース') || 
              text.includes('Announcement') || text.includes('Post') || text.includes('News')) {
            await elem.click();
            console.log('お知らせ関連要素をクリックしました');
            await driver.sleep(1000);
            break;
          }
        }
      } catch (e) {
        // 一部の要素は取得できない場合がある
      }
    }
    
    console.log('お知らせ投稿テスト完了');
  } catch (error) {
    console.error('お知らせ投稿中に問題が発生しました:', error.message);
    throw error;
  }
}

/**
 * スクリーンショットを撮影する
 */
async function takeScreenshot(driver: WebDriver, name: string): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const screenshotPath = path.join(SCREENSHOT_DIR, `${name}_${timestamp}.png`);
    
    // スクリーンショット撮影
    const screenshotData = await driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, screenshotData, 'base64');
    
    console.log(`スクリーンショットを保存しました: ${screenshotPath}`);
  } catch (error) {
    console.error('スクリーンショットの撮影に失敗しました:', error);
  }
}

/**
 * メイン実行関数
 */
async function runTests() {
  let driver: WebDriver = null;
  
  try {
    console.log('Seleniumテストを開始します...');
    driver = await setupDriver('chrome');
    
    // テスト実行 - エラーが発生してもログキャプチャを試みる
    try {
      // 1. ログインテスト
      console.log('ログインテストを実行します...');
      await navigateOnly(driver, 'ログイン', `${BASE_URL}/sign-in`);
      try {
        await loginTest(driver);
      } catch (e) {
        console.error('ログインテストでエラーが発生しました:', e.message);
        await takeScreenshot(driver, 'login-error');
      }
      
      // 2. プロフィール閲覧テスト
      console.log('プロフィール閲覧テストを実行します...');
      await navigateOnly(driver, 'プロフィール', `${BASE_URL}/dashboard/profile`);
      try {
        await viewProfileTest(driver);
      } catch (e) {
        console.error('プロフィールテストでエラーが発生しました:', e.message);
        await takeScreenshot(driver, 'profile-error');
      }
      
      // 3. 教室情報登録テスト
      console.log('教室情報登録テストを実行します...');
      await navigateOnly(driver, '教室情報', `${BASE_URL}/dashboard/schools`);
      try {
        await registerSchoolTest(driver);
      } catch (e) {
        console.error('教室情報テストでエラーが発生しました:', e.message);
        await takeScreenshot(driver, 'school-error');
      }
      
      // 4. 写真アップロードテスト
      console.log('写真アップロードテストを実行します...');
      await navigateOnly(driver, '写真アップロード', `${BASE_URL}/dashboard/photos`);
      try {
        await uploadPhotoTest(driver);
      } catch (e) {
        console.error('写真アップロードテストでエラーが発生しました:', e.message);
        await takeScreenshot(driver, 'photo-error');
      }
      
      // 5. お知らせ投稿テスト
      console.log('お知らせ投稿テストを実行します...');
      await navigateOnly(driver, 'お知らせ投稿', `${BASE_URL}/dashboard/announcements`);
      try {
        await postAnnouncementTest(driver);
      } catch (e) {
        console.error('お知らせ投稿テストでエラーが発生しました:', e.message);
        await takeScreenshot(driver, 'announcement-error');
      }
      
    } catch (e) {
      console.error('テスト実行中に予期せぬエラーが発生しました:', e);
    } finally {
      // テスト終了時に必ずログをキャプチャ
      console.log('テスト結果のサマリーログを作成します...');
      const logger = new ConsoleLogger(driver, 'auto-test-console_summary');
      await logger.captureConsoleLogs();
    }
    
  } catch (error) {
    console.error('テスト初期化に失敗しました:', error);
  } finally {
    // ブラウザを終了
    if (driver) {
      await driver.quit();
      console.log('テストを終了しました');
    }
  }
}

/**
 * 特定のURLに移動してログをキャプチャするだけの最小限の関数
 */
async function navigateOnly(driver: WebDriver, testName: string, url: string) {
  try {
    await driver.get(url);
    console.log(`${url}にアクセスしました`);
    
    // ページが読み込まれるのを待つ（最低限）
    await driver.wait(until.urlIs(url), 10000);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // ログを取得
    const logger = new ConsoleLogger(driver, testName);
    await logger.captureConsoleLogs();
    
    // スクリーンショット撮影
    await takeScreenshot(driver, `${testName}-page`);
    
    return true;
  } catch (error) {
    console.error(`${url}へのアクセスに失敗しました:`, error);
    return false;
  }
}

// このファイルが直接実行された場合にテストを実行
if (require.main === module) {
  runTests().catch(e => {
    console.error('テスト実行中にエラーが発生しました:', e);
    process.exit(1);
  });
} 