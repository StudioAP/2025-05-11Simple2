import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe/client';

/**
 * サブスクリプションステータスを確認し、未払いが続いている場合は教室情報を非公開にするAPI
 * このAPIはcronジョブなどから定期的に呼び出すことを想定
 */
export async function POST() {
  try {
    // サービスロールキーを使用してSupabaseクライアントを初期化
    const supabase = await createClient();

    // 現在の日時を取得
    const now = new Date();

    // 未払い状態のサブスクリプションを取得
    // past_dueステータスで、current_period_endから7日以上経過しているものを対象とする
    const { data: overdueSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, schools!inner(*)')
      .eq('status', 'past_due')
      .lt('current_period_end', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('schools.is_published', true);

    if (fetchError) {
      console.error('未払いサブスクリプション取得エラー:', fetchError);
      return NextResponse.json(
        { error: '未払いサブスクリプション情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 処理結果を格納する配列
    const results = [];

    // 各サブスクリプションに対して処理
    for (const subscription of overdueSubscriptions || []) {
      try {
        // Stripeでサブスクリプション情報を確認
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );

        // Stripeでも未払い状態の場合、教室情報を非公開に設定
        if (
          ['past_due', 'unpaid', 'canceled'].includes(stripeSubscription.status) ||
          stripeSubscription.cancel_at_period_end
        ) {
          // 教室情報を非公開に更新
          const { error: updateError } = await supabase
            .from('schools')
            .update({ is_published: false })
            .eq('user_id', subscription.user_id);

          if (updateError) {
            console.error(`教室ID ${subscription.schools.id} の公開ステータス更新エラー:`, updateError);
            results.push({
              school_id: subscription.schools.id,
              status: 'error',
              message: '教室情報の更新に失敗しました',
            });
          } else {
            results.push({
              school_id: subscription.schools.id,
              status: 'unpublished',
              message: '未払いのため非公開に設定しました',
            });
          }
        }
      } catch (error) {
        console.error(`サブスクリプションID ${subscription.id} の処理エラー:`, error);
        const errorMessage = error instanceof Error ? error.message : 'サブスクリプション情報の確認に失敗しました';
        results.push({
          school_id: subscription.schools.id,
          status: 'error',
          message: errorMessage,
        });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('サブスクリプションステータス確認エラー:', error);
    const outerErrorMessage = error instanceof Error ? error.message : 'サブスクリプションステータスの確認に失敗しました';
    return NextResponse.json(
      { error: outerErrorMessage },
      { status: 500 }
    );
  }
}
