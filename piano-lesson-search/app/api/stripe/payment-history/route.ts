import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe/client';

/**
 * 決済履歴を取得するAPI
 * 指定されたカスタマーIDに関連する支払い情報を返します
 */
export async function GET(request: Request) {
  try {
    // URLからクエリパラメータを取得
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'カスタマーIDが必要です' },
        { status: 400 }
      );
    }

    // Supabaseクライアントを初期化
    const supabase = await createClient();

    // ユーザー情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証エラー' },
        { status: 401 }
      );
    }

    // ユーザーのサブスクリプション情報を取得して権限チェック
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'サブスクリプション情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // ユーザーIDが一致するか確認
    if (subscription && subscription.user_id !== user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // Stripeから支払い履歴を取得
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 10, // 最新10件を取得
    });

    // 支払い情報を整形
    const paymentHistory = charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount,
      status: charge.status,
      created: new Date(charge.created * 1000).toISOString(),
      invoice_pdf: charge.receipt_url,
    }));

    return NextResponse.json({ data: paymentHistory });
  } catch (error: any) {
    console.error('決済履歴取得エラー:', error);
    return NextResponse.json(
      { error: error.message || '決済履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}
