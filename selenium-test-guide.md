# Seleniumテスト実装ガイド

## 概要
このドキュメントは、piano-rythmique（ピアノリトミック）アプリケーション用のSelenium自動テスト実装に関する詳細なガイドです。テストの追加、メンテナンス、エラー解析のための参考資料として使用してください。

## テスト環境のセットアップ

### 依存関係
```bash
npm install selenium-webdriver dotenv
npm install -D typescript ts-node @types/node @types/selenium-webdriver
```

### プロジェクト構成
```
selenium-e2e/
├── school-owner/      # 教室オーナー向けテスト
│   └── auto-test-console.ts
├── utils/             # 共通ユーティリティ
│   ├── driver-setup.ts
│   ├── console-logger.ts
│   └── log-analyzer.ts
├── test-debug-output/ # テスト結果出力
│   ├── console-logs/
│   ├── reports/
│   └── screenshots/
├── types.d.ts         # 型定義ファイル
├── tsconfig.json      # TypeScript設定
└── package.json       # npm設定
```

## WebDriverの設定

### ドライバーのセットアップ
```typescript
// driver-setup.ts
import { Builder, WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';

export async function setupDriver(
  browserName: 'chrome' | 'firefox' = 'chrome',
  options?: any
): Promise<WebDriver> {
  // Chromeオプションの設定
  if (!options && browserName === 'chrome') {
    options = new ChromeOptions();
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--no-sandbox');
    options.addArguments('--headless'); // ヘッドレスモード

    // コンソールログキャプチャのためのロギング設定
    options.setLoggingPrefs({ browser: 'ALL' });
  }

  const driver = await new Builder()
    .forBrowser(browserName)
    .setChromeOptions(options)
    .build();
    
  // ウィンドウサイズ設定
  await driver.manage().window().setRect({ width: 1366, height: 768 });
  
  return driver;
}
```

## テストケース実装のベストプラクティス

### 堅牢なセレクタの使用

セレクタは複数の方法で要素を検索するようにし、一つの方法が失敗した場合の代替手段を用意します：

```typescript
// まずIDで検索
try {
  const emailField = await driver.findElement(By.id('email'));
  await emailField.sendKeys(TEST_EMAIL);
} catch (e) {
  // IDが見つからない場合はCSS属性で検索
  console.log('IDによる検索失敗、CSS属性で検索します');
  const emailField = await driver.findElement(By.css('input[type="email"]'));
  await emailField.sendKeys(TEST_EMAIL);
}
```

### 待機の適切な使用

```typescript
// 明示的な待機 - 特定の条件が満たされるまで待機
await driver.wait(until.elementLocated(By.id('email')), 10000);

// 暗黙的な待機 - ページやUIの読み込みを待機
await driver.sleep(2000);
```

### エラーハンドリング

```typescript
try {
  // テストコード
} catch (error) {
  // エラーログ出力
  console.error('テスト中にエラーが発生しました:', error.message);
  
  // スクリーンショット撮影
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const screenshotPath = path.join(SCREENSHOT_DIR, `error-${timestamp}.png`);
  await driver.takeScreenshot().then(data => {
    fs.writeFileSync(screenshotPath, data, 'base64');
  });
  
  throw error; // 上位のエラーハンドラに再スロー
}
```

## コンソールログの分析

```typescript
// コンソールログのキャプチャ
const logs = await driver.manage().logs().get('browser');

// エラーパターンの検出
logs.forEach(log => {
  if (log.level.name === 'SEVERE') {
    // Supabaseエラーの検出
    if (log.message.includes('RLS') || log.message.includes('policy')) {
      console.error('RLSポリシー違反を検出しました');
    }
    
    // 認証エラーの検出
    if (log.message.includes('401') || log.message.includes('unauthorized')) {
      console.error('認証エラーを検出しました');
    }
  }
});
```

## テキスト要素を含む要素の探し方

Webサイトの実装によっては、テキストを含む要素を見つけるのに複数のアプローチが必要な場合があります：

```typescript
// XPathによる部分テキスト検索
const loginButton = await driver.findElement(
  By.xpath('//button[contains(., "ログイン") or contains(., "Login")]')
);

// 全ての要素から探す
const elements = await driver.findElements(By.css('a, button, div'));
for (const elem of elements) {
  const text = await elem.getText();
  if (text.includes('プロフィール')) {
    await elem.click();
    break;
  }
}
```

## 実際の使用例

### 完全なテスト実装例

```typescript
async function loginTest(driver: WebDriver) {
  // サイトにアクセス
  await driver.get(`${BASE_URL}/auth/signin`);
  
  // メールとパスワードの入力（複数のセレクタ試行）
  try {
    // ...実装例は上記参照
  } catch (e) {
    // ...
  }
  
  // ログインボタンをクリック
  const loginButton = await driver.findElement(By.css('button[type="submit"]'));
  await loginButton.click();
  
  // リダイレクト後のURLを確認
  await driver.wait(until.urlContains('/dashboard'), 5000);
}
```

## エラー分析とレポート

`log-analyzer.ts`を使用して、ブラウザコンソールからキャプチャしたエラーを分析します：

```typescript
const { issues, filePath } = await LogAnalyzer.analyzeLatestLogs(CONSOLE_LOGS_DIR);

if (issues.length > 0) {
  // レポート生成
  const reportPath = path.join(REPORTS_DIR, `error-report-${timestamp}.md`);
  await LogAnalyzer.generateReport(issues, reportPath);
}
```

## 検出可能なエラーパターン

- **RLSポリシー違反**: バケットアクセスやデータベースクエリ権限のエラー
- **認証エラー**: JWT無効、メール未確認、認証切れなど
- **スキーマエラー**: カラム不在、テーブル不在、型不一致
- **ネットワークエラー**: CORS違反、接続タイムアウト、レート制限

## トラブルシューティング

### 要素が見つからない場合
1. ページが完全に読み込まれていない可能性：`driver.sleep()`で待機
2. セレクタが変更された可能性：複数のセレクタを試す
3. iframeやシャドウDOMの使用：特殊な検索方法が必要

### テスト実行が遅い場合
1. ヘッドレスモードの使用：`--headless`オプション
2. 明示的な待機の最適化：タイムアウト値の調整
3. 不要なスリープの削減

### 環境ごとの差異
1. 環境変数を使用：`.env.local`ファイルに設定
2. テスト用アカウントの分離：専用のテストユーザー
3. 環境判定ロジックの追加：本番/開発/テスト環境の自動判別

## 参考リソース
- [Selenium WebDriver公式ドキュメント](https://www.selenium.dev/documentation/webdriver/)
- [Selenium TypeScript型定義](https://www.npmjs.com/package/@types/selenium-webdriver) 