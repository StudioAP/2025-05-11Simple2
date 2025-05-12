import { NextResponse } from 'next/server';

/**
 * 問い合わせメール送信API
 * 注意: このエンドポイントは非推奨です。代わりに /api/contact/send を使用してください。
 * 互換性のために残していますが、将来的に削除される可能性があります。
 */
export async function POST(request: Request) {
  // リクエストURLを /api/contact/send に変更してリダイレクト
  const url = new URL(request.url);
  const baseUrl = url.origin;
  const redirectUrl = `${baseUrl}/api/contact/send`;
  
  // リクエストをそのまま転送
  return fetch(redirectUrl, {
    method: 'POST',
    headers: request.headers,
    body: request.body,
  });
}
