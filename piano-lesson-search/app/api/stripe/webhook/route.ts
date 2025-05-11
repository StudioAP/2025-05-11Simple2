import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe/client';

// Stripeウェブフックの処理
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') as string;

  // シークレットキーが設定されていない場合はエラー
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripeウェブフックシークレットが設定されていません');
    return NextResponse.json(
      { error: 'ウェブフックシークレットが設定されていません' },
      { status: 500 }
    );
  }

  let event;

  try {
    // イベントを検証
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`ウェブフック署名検証エラー: ${err.message}`);
    return NextResponse.json(
      { error: `ウェブフック署名検証エラー: ${err.message}` },
      { status: 400 }
    );
  }

  // Supabaseクライアントを初期化
  const supabase = await createClient();

  // イベントタイプに基づいて処理
  try {
    switch (event.type) {
      // 支払い成功イベント
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // メタデータからユーザーIDを取得
        const userId = session.metadata?.user_id;
        
        if (userId) {
          // サブスクリプション情報を保存
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              status: 'active',
              current_period_end: new Date(session.subscription_data?.subscription_end * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error('サブスクリプション情報保存エラー:', error);
            throw error;
          }

          // 教室の公開ステータスを更新
          const { error: schoolError } = await supabase
            .from('schools')
            .update({ is_published: true })
            .eq('user_id', userId);

          if (schoolError) {
            console.error('教室公開ステータス更新エラー:', schoolError);
            throw schoolError;
          }
        }
        break;

      // サブスクリプション更新イベント
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        
        // サブスクリプションIDがある場合のみ処理
        if (invoice.subscription) {
          // サブスクリプション情報を取得
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          // メタデータからユーザーIDを取得、なければカスタマーIDから検索
          let subUserId = subscription.metadata?.user_id;
          
          if (!subUserId) {
            // サブスクリプションテーブルからユーザーIDを検索
            const { data: subData } = await supabase
              .from('subscriptions')
              .select('user_id')
              .eq('stripe_subscription_id', invoice.subscription)
              .single();
            
            if (subData) {
              subUserId = subData.user_id;
            }
          }
          
          if (subUserId) {
            // サブスクリプション情報を更新
            const { error } = await supabase
              .from('subscriptions')
              .update({
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', subUserId);

            if (error) {
              console.error('サブスクリプション情報更新エラー:', error);
              throw error;
            }
          }
        }
        break;

      // サブスクリプション失敗イベント
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        
        if (failedInvoice.subscription) {
          // サブスクリプション情報を取得
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', failedInvoice.subscription)
            .single();
          
          if (subData) {
            // サブスクリプションステータスを更新
            const { error } = await supabase
              .from('subscriptions')
              .update({
                status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', subData.user_id);

            if (error) {
              console.error('サブスクリプションステータス更新エラー:', error);
              throw error;
            }
          }
        }
        break;

      // サブスクリプション解約イベント
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        
        // メタデータからユーザーIDを取得、なければサブスクリプションIDから検索
        let deletedUserId = deletedSubscription.metadata?.user_id;
        
        if (!deletedUserId) {
          // サブスクリプションテーブルからユーザーIDを検索
          const { data: deletedSubData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', deletedSubscription.id)
            .single();
          
          if (deletedSubData) {
            deletedUserId = deletedSubData.user_id;
          }
        }
        
        if (deletedUserId) {
          // サブスクリプション情報を更新
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', deletedUserId);

          if (error) {
            console.error('サブスクリプション解約エラー:', error);
            throw error;
          }

          // 教室の公開ステータスを非公開に更新
          const { error: schoolError } = await supabase
            .from('schools')
            .update({ is_published: false })
            .eq('user_id', deletedUserId);

          if (schoolError) {
            console.error('教室公開ステータス更新エラー:', schoolError);
            throw schoolError;
          }
        }
        break;

      default:
        // 処理しないイベントタイプ
        console.log(`未処理のイベントタイプ: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`ウェブフック処理エラー: ${error.message}`);
    return NextResponse.json(
      { error: `ウェブフック処理エラー: ${error.message}` },
      { status: 500 }
    );
  }
}
