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

    // 教室情報を取得
    const { data: schools, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('user_id', userId);

    if (schoolError) {
      return NextResponse.json(
        { error: '教室情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 教室名を取得（なければデフォルト値を使用）
    const schoolName = schools && schools.length > 0
      ? schools[0].name
      : 'ピアノ・リトミック教室';

    // 月額プランのPriceを作成
    const price = await stripe.prices.create({
      currency: 'jpy',
      unit_amount: 500, // 500円
      recurring: { interval: 'month' },
      product_data: {
        name: `${schoolName} 掲載プラン`,
        description: '教室情報の掲載（月額500円）',
      },
    });

    // 支払いリンクを作成
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription?success=true`,
        },
      },
      metadata: {
        user_id: userId,
      },
    });

    // 支払いリンクURLを返す
    return NextResponse.json({ url: paymentLink.url });
  } catch (error: any) {
    console.error('Stripe支払いリンク作成エラー:', error);
    return NextResponse.json(
      { error: error.message || '支払いリンクの作成に失敗しました' },
      { status: 500 }
    );
  }
}
