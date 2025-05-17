/**
 * エラーハンドリングのためのユーティリティ関数
 */

import { toast } from 'react-hot-toast';

// エラーコードとメッセージのマッピング
export const ERROR_MESSAGES = {
  // 認証関連エラー
  'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
  'auth/invalid-email': '有効なメールアドレスを入力してください',
  'auth/user-disabled': 'このアカウントは無効になっています',
  'auth/user-not-found': 'ユーザーが見つかりません',
  'auth/wrong-password': 'パスワードが正しくありません',
  'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく時間をおいてから再度お試しください',
  'auth/email-not-verified': 'メールアドレスが確認されていません。メールをご確認ください',
  
  // データベース関連エラー
  'db/connection-error': 'データベース接続エラーが発生しました',
  'db/query-error': 'データの取得中にエラーが発生しました',
  'db/insert-error': 'データの保存中にエラーが発生しました',
  'db/update-error': 'データの更新中にエラーが発生しました',
  'db/delete-error': 'データの削除中にエラーが発生しました',
  
  // ストレージ関連エラー
  'storage/object-not-found': 'ファイルが見つかりません',
  'storage/unauthorized': 'ファイルへのアクセス権限がありません',
  'storage/canceled': 'ファイルのアップロードがキャンセルされました',
  'storage/unknown': 'ファイルのアップロード中に不明なエラーが発生しました',
  
  // API関連エラー
  'api/network-error': 'ネットワークエラーが発生しました。インターネット接続を確認してください',
  'api/timeout': 'リクエストがタイムアウトしました。しばらく時間をおいてから再度お試しください',
  'api/server-error': 'サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください',
  'api/not-found': 'リクエストされたリソースが見つかりません',
  'api/forbidden': 'このリソースへのアクセス権限がありません',
  'api/rate-limit': 'リクエスト制限に達しました。しばらく時間をおいてから再度お試しください',
  
  // 決済関連エラー
  'payment/card-error': 'カード情報の処理中にエラーが発生しました',
  'payment/expired-card': 'カードの有効期限が切れています',
  'payment/invalid-cvc': 'セキュリティコードが無効です',
  'payment/processing-error': '決済処理中にエラーが発生しました',
  'payment/declined': 'カードが拒否されました',
  
  // 入力検証エラー
  'validation/required': '必須項目が入力されていません',
  'validation/email-format': '有効なメールアドレスを入力してください',
  'validation/password-strength': 'パスワードが弱すぎます',
  'validation/password-mismatch': 'パスワードが一致しません',
  
  // デフォルトエラー
  'default': 'エラーが発生しました。しばらく時間をおいてから再度お試しください',
};

/**
 * エラーコードからユーザーフレンドリーなメッセージを取得する
 * @param errorCode エラーコード
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;
}

// エラーオブジェクトが持ちうるプロパティを考慮した型
interface LikelyError {
  message?: string;
  code?: string | number;
  status?: number;
  type?: string;
}

/**
 * エラーオブジェクトからエラーコードを抽出する
 * @param error エラーオブジェクト
 * @returns エラーコード
 */
export function extractErrorCode(error: unknown): string {
  if (!error) return 'default';
  
  if (typeof error !== 'object' || error === null) {
    return 'default';
  }

  const err = error as LikelyError;

  if (typeof err.code === 'string') {
    return err.code;
  }
  
  if (typeof err.message === 'string') {
    if (err.message.includes('auth/')) {
      const match = err.message.match(/auth\/[\w-]+/);
      if (match) return match[0];
    }
    
    if (err.message.includes('network')) {
      return 'api/network-error';
    }
    
    if (err.message.includes('timeout')) {
      return 'api/timeout';
    }
  }
  
  if (typeof err.status === 'number') {
    switch (err.status) {
      case 400: return 'api/bad-request';
      case 401: return 'api/unauthorized';
      case 403: return 'api/forbidden';
      case 404: return 'api/not-found';
      case 408: return 'api/timeout';
      case 429: return 'api/rate-limit';
      case 500: return 'api/server-error';
    }
  }
  
  return 'default';
}

/**
 * エラーをハンドリングしてユーザーに通知する
 * @param error エラーオブジェクト
 * @param customMessage カスタムメッセージ（オプション）
 */
export function handleError(error: unknown, customMessage?: string): void {
  console.error('Error occurred:', error);
  
  const errorCode = extractErrorCode(error);
  const message = customMessage || getErrorMessage(errorCode);
  
  // トーストで通知
  toast.error(message);
  
  // エラーログを送信（本番環境のみ）
  if (process.env.NODE_ENV === 'production') {
    // エラーログ送信処理（実際の実装はここに追加）
  }
}

// エラーの戻り値型を定義
type ApiError = LikelyError | Error | null;

/**
 * API呼び出しをエラーハンドリング付きで実行する
 * @param apiCall API呼び出し関数
 * @param errorMessage エラー時のカスタムメッセージ
 * @returns API呼び出しの結果
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  errorMessage?: string
): Promise<{ data: T | null; error: ApiError }> {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    handleError(error, errorMessage);

    if (error instanceof Error) {
    return { data: null, error };
    }
    // LikelyErrorにキャスト可能か、あるいは最低限のプロパティを持つか確認
    if (typeof error === 'object' && error !== null) {
      const likelyError = error as LikelyError;
      // Check if it has at least one of the LikelyError properties
      if (
        typeof likelyError.message === 'string' ||
        typeof likelyError.code !== 'undefined' ||
        typeof likelyError.status !== 'undefined' ||
        typeof likelyError.type === 'string'
      ) {
        return { data: null, error: {
            message: likelyError.message,
            code: likelyError.code,
            status: likelyError.status,
            type: likelyError.type
        } as LikelyError };
      }
    }
    // If not an Error instance and not shaped like LikelyError, return a new Error
    return { data: null, error: new Error(typeof error === 'string' ? error : 'An unknown error occurred in safeApiCall') };
  }
}

/**
 * フォームエラーをフォーマットする
 * @param errors エラーオブジェクト
 * @returns フォーマットされたエラーメッセージ
 */
export function formatFormErrors(errors: Record<string, string[]>): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  Object.entries(errors).forEach(([field, messages]) => {
    formattedErrors[field] = messages[0] || 'エラーが発生しました';
  });
  
  return formattedErrors;
}
