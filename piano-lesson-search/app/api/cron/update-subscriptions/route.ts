import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe/client';

/**
 * サブスクリプションステータスを一括更新するAPI
 * このAPIはcronジョブから定期的に呼び出すことを想定
 * 例: 毎日深夜に実行して、サブスクリプションステータスと教室の公開状態を同期する
 */
export async function POST(request: Request) {
  try {
    // 認証キーの検証（本番環境では適切な認証を実装すること）
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    // 実際の環境では環境変数などから安全なトークンを取得して比較する
    // ここではサンプルとして簡易的な実装
    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: '無効なトークン' }, { status: 401 });
    }

    // Supabaseクライアントを初期化
    const supabase = await createClient();

    // アクティブなサブスクリプションを持つユーザーを取得
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, schools!inner(*)')
      .in('status', ['active', 'past_due', 'trialing']);

    if (fetchError) {
      console.error('サブスクリプション取得エラー:', fetchError);
      return NextResponse.json(
        { error: 'サブスクリプション情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 処理結果を格納する配列
    const results = [];

    // 各サブスクリプションに対して処理
    for (const subscription of subscriptions || []) {
      try {
        if (!subscription.stripe_subscription_id) {
          continue;
        }

        // Stripeでサブスクリプション情報を確認
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );

        // Stripeのステータスと現在のステータスが異なる場合は更新
        if (stripeSubscription.status !== subscription.status) {
          // サブスクリプションステータスを更新
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: stripeSubscription.status,
              // @ts-expect-error - Type definition mismatch
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          if (updateError) {
            console.error(`サブスクリプションID ${subscription.id} の更新エラー:`, updateError);
            results.push({
              subscription_id: subscription.id,
              status: 'error',
              message: 'サブスクリプション情報の更新に失敗しました',
            });
            continue;
          }

          // 教室の公開状態を更新
          const shouldBePublished = ['active', 'trialing'].includes(stripeSubscription.status);
          
          if (subscription.schools.is_published !== shouldBePublished) {
            const { error: schoolUpdateError } = await supabase
              .from('schools')
              .update({ is_published: shouldBePublished })
              .eq('id', subscription.schools.id);

            if (schoolUpdateError) {
              console.error(`教室ID ${subscription.schools.id} の公開状態更新エラー:`, schoolUpdateError);
              results.push({
                subscription_id: subscription.id,
                school_id: subscription.schools.id,
                status: 'error',
                message: '教室情報の更新に失敗しました',
              });
              continue;
            }
          }

          results.push({
            subscription_id: subscription.id,
            school_id: subscription.schools.id,
            old_status: subscription.status,
            new_status: stripeSubscription.status,
            is_published: shouldBePublished,
            status: 'updated',
          });
        } else {
          // ステータスに変更がない場合
          results.push({
            subscription_id: subscription.id,
            school_id: subscription.schools.id,
            status: 'unchanged',
          });
        }
      } catch (error) {
        console.error(`サブスクリプションID ${subscription.id} の処理エラー:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'サブスクリプション情報の確認に失敗しました';
        let errorCode: string | undefined;
        if (error && typeof error === 'object' && 'code' in error) {
          errorCode = String(error.code);
        }

        // サブスクリプションが見つからない場合
        if (errorCode === 'resource_missing') {
          // サブスクリプション情報をクリア
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          if (updateError) {
            console.error(`サブスクリプションID ${subscription.id} の更新エラー:`, updateError);
          }

          // 教室を非公開に設定
          const { error: schoolUpdateError } = await supabase
            .from('schools')
            .update({ is_published: false })
            .eq('id', subscription.schools.id);

          if (schoolUpdateError) {
            console.error(`教室ID ${subscription.schools.id} の公開状態更新エラー:`, schoolUpdateError);
          }

          results.push({
            subscription_id: subscription.id,
            school_id: subscription.schools.id,
            status: 'canceled',
            message: 'サブスクリプションが見つからないため、キャンセル済みに設定しました',
          });
        } else {
          results.push({
            subscription_id: subscription.id,
            status: 'error',
            message: errorMessage,
          });
        }
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('サブスクリプション一括更新エラー:', error);
    const outerErrorMessage = error instanceof Error ? error.message : 'サブスクリプションの一括更新に失敗しました';
    return NextResponse.json(
      { error: outerErrorMessage },
      { status: 500 }
    );
  }
}
