import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe/client';

export async function POST(request: Request) {
  try {
    // リクエストボディからサブスクリプションIDを取得
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'サブスクリプションIDが必要です' },
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

    // サブスクリプション情報を取得して権限チェック
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (subError) {
      return NextResponse.json(
        { error: 'サブスクリプション情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // ユーザーIDが一致するか確認
    if (subscription.user_id !== user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // Stripeサブスクリプションをキャンセル
    // 次回の請求サイクルの終了時にキャンセルされるように設定
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // サブスクリプションステータスを更新
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('サブスクリプション更新エラー:', updateError);
      return NextResponse.json(
        { error: 'サブスクリプション情報の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Stripeサブスクリプションキャンセルエラー:', error);
    return NextResponse.json(
      { error: error.message || 'サブスクリプションのキャンセルに失敗しました' },
      { status: 500 }
    );
  }
}
