import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe/client';

export async function POST(request: Request) {
  try {
    // リクエストボディからユーザーIDを取得
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
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

    // リクエストしたユーザーIDと認証済みユーザーIDが一致するか確認
    if (user.id !== userId) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // 環境変数からStripe Price IDを取得
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      console.error('Stripe Price IDが設定されていません。');
      return NextResponse.json(
        { error: 'サーバー設定エラー: Price IDが見つかりません。' },
        { status: 500 }
      );
    }

    // 支払いリンクを作成
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId, // 修正：環境変数から取得したPrice IDを使用
          quantity: 1,
        },
      ],
      subscription_data: { // サブスクリプションにメタデータを設定
        metadata: {
          user_id: userId,
        },
      },
      metadata: { // PaymentLinkオブジェクト自体のメタデータ
        user_id: userId, // 念のため残すが、subscription_data.metadataが重要
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`, // session_idを渡してクライアント側で確認できるようにする
        },
      },
    });

    // 支払いリンクURLを返す
    return NextResponse.json({ url: paymentLink.url });
  } catch (error) {
    console.error('Stripe支払いリンク作成エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '支払いリンクの作成に失敗しました';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
