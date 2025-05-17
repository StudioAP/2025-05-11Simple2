/**
 * Stripeエラーをユーザーフレンドリーなメッセージに変換する
 * @param error Stripeエラーオブジェクト
 * @returns ユーザーフレンドリーなエラーメッセージ
 */

// Stripeエラーオブジェクトの形状に近いインターフェース
interface StripeErrorLike {
  type?: string;
  code?: string;
  message?: string;
  // 必要に応じて他のStripeエラープロパティをここに追加
}

export function formatStripeError(error: unknown): string {
  if (!error) return '不明なエラーが発生しました';

  let errorMessage = '決済処理中にエラーが発生しました。後ほど再度お試しください。'; // デフォルトメッセージ
  let stripeErrorCode: string | undefined;
  let stripeErrorType: string | undefined;

  if (typeof error === 'object' && error !== null) {
    // error オブジェクトからプロパティを安全に抽出しようと試みる
    const err = error as StripeErrorLike; // キャスト

    if (typeof err.message === 'string' && err.message) {
      errorMessage = err.message;
    }
    if (typeof err.code === 'string') {
      stripeErrorCode = err.code;
    }
    if (typeof err.type === 'string') {
      stripeErrorType = err.type;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    // error が単なる文字列の場合
    errorMessage = error;
  }

  // Stripe特有のエラーコードが存在し、特定のケースに一致する場合
  if (stripeErrorType && stripeErrorCode) {
    switch (stripeErrorCode) {
      case 'card_declined':
        return 'カードが拒否されました。別のお支払い方法をお試しください。';
      case 'expired_card':
        return 'カードの有効期限が切れています。';
      case 'incorrect_cvc':
        return 'セキュリティコードが正しくありません。';
      case 'processing_error':
        return '処理中にエラーが発生しました。後ほど再度お試しください。';
      case 'rate_limit':
        return 'リクエストが多すぎます。しばらくしてから再度お試しください。';
      default:
        // 上記以外のStripeエラーコードの場合、抽出したメッセージを使用
        // errorMessage は既に err.message で設定されている可能性がある
        return errorMessage || '決済処理中に不明なエラーが発生しました。'; 
    }
  }

  // Stripe特有のエラーコードがない場合や、objectでもErrorでもstringでもない場合
  // または、Stripeエラーでも特定のcaseに一致しなかったが、err.messageがあった場合など
  return errorMessage;
}
