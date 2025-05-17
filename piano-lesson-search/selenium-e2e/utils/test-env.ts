/**
 * テスト環境設定
 * 
 * このファイルでは、E2Eテストの実行環境に関する設定を管理します。
 * 環境変数から値を読み取るか、デフォルト値を使用します。
 */

// テスト対象のベースURL
export const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// テストのタイムアウト設定
export const NAVIGATION_TIMEOUT = parseInt(process.env.TEST_NAVIGATION_TIMEOUT || '10000', 10);
export const ELEMENT_TIMEOUT = parseInt(process.env.TEST_ELEMENT_TIMEOUT || '10000', 10);
export const GLOBAL_TEST_TIMEOUT = parseInt(process.env.TEST_GLOBAL_TIMEOUT || '60000', 10);

// テスト用アカウント情報（事前に作成済みのアカウントを使う場合）
export const TEST_PREDEFINED_EMAIL = process.env.TEST_USER_EMAIL;
export const TEST_PREDEFINED_PASSWORD = process.env.TEST_USER_PASSWORD;

// テスト実行モード
export const TEST_MODE = process.env.TEST_MODE || 'normal'; // 'normal', 'skip-email-verification'

// スクリーンショットや出力の設定
export const CAPTURE_SCREENSHOTS = process.env.CAPTURE_SCREENSHOTS !== 'false';
export const DEBUG_OUTPUT_DIR = process.env.DEBUG_OUTPUT_DIR || 'selenium-e2e/test-debug-output';

// テスト用データ
export const TEST_SCHOOL_TYPE_ID = process.env.TEST_SCHOOL_TYPE_ID || '1';

// テスト用の固定値
export const TEST_USER_PREFIX = 'test_user';
export const TEST_EMAIL_DOMAIN = 'example.com';
export const TEST_PASSWORD = 'Test1234!';

// 環境変数関連
export const TEST_ENV_FLAG = 'TEST_MODE';

/**
 * テストモードの判定
 */
export const shouldSkipEmailVerification = () => {
  return TEST_MODE === 'skip-email-verification';
};

/**
 * メール確認をスキップする必要がある場合に使用するURLを取得
 */
export const getEmailVerificationBypassUrl = () => {
  if (shouldSkipEmailVerification() && TEST_PREDEFINED_EMAIL && TEST_PREDEFINED_PASSWORD) {
    return `${TEST_BASE_URL}/dashboard`;
  }
  return null;
};

/**
 * テスト実行環境の情報を取得
 */
export const getTestEnvironmentInfo = () => {
  return {
    baseUrl: TEST_BASE_URL,
    timeouts: {
      navigation: NAVIGATION_TIMEOUT,
      element: ELEMENT_TIMEOUT,
      test: GLOBAL_TEST_TIMEOUT,
    },
    mode: TEST_MODE,
    captureScreenshots: CAPTURE_SCREENSHOTS,
  };
};

// 環境変数かクエリパラメータでテストモードを判定
export function isTestEnvironment(): boolean {
  // Node.js環境（実際のテスト実行時）
  if (typeof process !== 'undefined' && process.env) {
    return process.env[TEST_ENV_FLAG] === 'true';
  }
  
  // ブラウザ環境（アプリケーション実行時）
  if (typeof window !== 'undefined') {
    // URL内のクエリパラメータを確認
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(TEST_ENV_FLAG) === 'true';
  }
  
  return false;
}

// テストモードでの認証バイパス設定
export const AUTH_BYPASS_ENABLED = true;

// 自動テスト用のユーザー名を生成（重複回避）
export function generateTestUsername(prefix = TEST_USER_PREFIX): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}

// 自動テスト用のメールアドレスを生成（重複回避）
export function generateTestEmail(prefix = TEST_USER_PREFIX): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}@${TEST_EMAIL_DOMAIN}`;
}

// テスト用パスワード
export function getTestPassword(): string {
  return TEST_PASSWORD;
} 