/**
 * Stripeエラーをユーザーフレンドリーなメッセージに変換する
 * @param error Stripeエラーオブジェクト
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function formatStripeError(error: any): string {
  if (!error) return '不明なエラーが発生しました';

  // Stripeのエラーオブジェクトの場合
  if (error.type && error.code) {
    switch (error.code) {
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
        return error.message || '決済処理中にエラーが発生しました。';
    }
  }

  // 一般的なエラーメッセージ
  return error.message || '決済処理中にエラーが発生しました。後ほど再度お試しください。';
}
