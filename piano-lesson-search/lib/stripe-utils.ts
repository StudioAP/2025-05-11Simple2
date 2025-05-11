/**
 * Stripe決済関連のユーティリティ関数
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { handleError } from './error-utils';

// Stripeのパブリックキー
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Stripeインスタンスのキャッシュ
let stripePromise: Promise<Stripe | null>;

/**
 * Stripeインスタンスを取得する
 * @returns Stripeインスタンス
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

/**
 * 支払いリンクを作成する
 * @param priceId 価格ID
 * @param customerId 顧客ID（オプション）
 * @param successUrl 成功時のリダイレクトURL
 * @param cancelUrl キャンセル時のリダイレクトURL
 * @returns 支払いリンクのURL
 */
export async function createPaymentLink(
  priceId: string,
  customerId?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<string | null> {
  try {
    const response = await fetch('/api/stripe/create-payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('支払いリンクの作成に失敗しました');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    handleError(error, '支払いリンクの作成に失敗しました');
    return null;
  }
}

/**
 * サブスクリプションをキャンセルする
 * @param subscriptionId サブスクリプションID
 * @returns 成功したかどうか
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('サブスクリプションのキャンセルに失敗しました');
    }

    return true;
  } catch (error) {
    handleError(error, 'サブスクリプションのキャンセルに失敗しました');
    return false;
  }
}

/**
 * サブスクリプションの状態を確認する
 * @param subscriptionId サブスクリプションID
 * @returns サブスクリプションの状態
 */
export async function checkSubscriptionStatus(subscriptionId: string): Promise<{
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing' | 'unknown';
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}> {
  try {
    const response = await fetch(`/api/stripe/subscription-status?id=${subscriptionId}`);

    if (!response.ok) {
      throw new Error('サブスクリプションの状態の取得に失敗しました');
    }

    const data = await response.json();
    return {
      status: data.status || 'unknown',
      currentPeriodEnd: data.current_period_end || null,
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
    };
  } catch (error) {
    handleError(error, 'サブスクリプションの状態の取得に失敗しました');
    return {
      status: 'unknown',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }
}

/**
 * サブスクリプションを更新する
 * @param subscriptionId サブスクリプションID
 * @param newPriceId 新しい価格ID
 * @returns 成功したかどうか
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/stripe/update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        newPriceId,
      }),
    });

    if (!response.ok) {
      throw new Error('サブスクリプションの更新に失敗しました');
    }

    return true;
  } catch (error) {
    handleError(error, 'サブスクリプションの更新に失敗しました');
    return false;
  }
}

/**
 * 顧客ポータルセッションを作成する
 * @param customerId 顧客ID
 * @param returnUrl リターンURL
 * @returns 顧客ポータルのURL
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string | null> {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('顧客ポータルセッションの作成に失敗しました');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    handleError(error, '顧客ポータルセッションの作成に失敗しました');
    return null;
  }
}
