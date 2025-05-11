/**
 * セキュリティ強化のためのユーティリティ関数
 */

import { createHash, randomBytes } from 'crypto';

/**
 * CSRFトークンを生成する
 * @returns CSRFトークン
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * 文字列をハッシュ化する
 * @param text ハッシュ化する文字列
 * @returns ハッシュ化された文字列
 */
export function hashString(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Content Security Policyヘッダーを生成する
 * @returns CSPヘッダー文字列
 */
export function generateCSP(): string {
  const policy = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'js.stripe.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', '*.supabase.co', '*.supabase.in'],
    'font-src': ["'self'"],
    'connect-src': [
      "'self'",
      '*.supabase.co',
      '*.supabase.in',
      'api.stripe.com',
    ],
    'frame-src': ["'self'", 'js.stripe.com', 'hooks.stripe.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
    'block-all-mixed-content': [],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(policy)
    .map(([key, values]) => {
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * XSS対策のためのテキストサニタイズ
 * @param text サニタイズするテキスト
 * @returns サニタイズされたテキスト
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 安全なリダイレクトURLかどうかを検証する
 * @param url 検証するURL
 * @returns 安全なURLかどうか
 */
export function isSafeRedirectUrl(url: string): boolean {
  // 相対パスは安全
  if (url.startsWith('/')) {
    return true;
  }

  try {
    // URLをパースして同一オリジンかどうかをチェック
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://piano-lesson-search.vercel.app';
    const siteOrigin = new URL(siteUrl).origin;
    const targetOrigin = new URL(url).origin;
    
    return siteOrigin === targetOrigin;
  } catch {
    // URLのパースに失敗した場合は安全でないと判断
    return false;
  }
}

/**
 * パスワードの強度をチェックする
 * @param password チェックするパスワード
 * @returns パスワードの強度（0-4）と改善提案
 */
export function checkPasswordStrength(password: string): {
  score: number;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 0;

  // 長さのチェック
  if (password.length < 8) {
    suggestions.push('パスワードは8文字以上にしてください');
  } else {
    score += 1;
  }

  // 大文字小文字のチェック
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    suggestions.push('大文字と小文字を含めてください');
  } else {
    score += 1;
  }

  // 数字のチェック
  if (!/\d/.test(password)) {
    suggestions.push('数字を含めてください');
  } else {
    score += 1;
  }

  // 特殊文字のチェック
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    suggestions.push('特殊文字（!@#$%^&*など）を含めてください');
  } else {
    score += 1;
  }

  return { score, suggestions };
}

/**
 * APIリクエストのレート制限を確認する
 * @param ip IPアドレス
 * @param endpoint エンドポイント
 * @param limit 制限回数
 * @param windowMs 時間枠（ミリ秒）
 * @returns 制限を超えているかどうか
 */
export async function checkRateLimit(
  ip: string,
  endpoint: string,
  limit: number = 60,
  windowMs: number = 60000
): Promise<boolean> {
  // 実際の実装ではRedisなどを使用してレート制限を管理する
  // このサンプルでは常にfalseを返す
  return false;
}
