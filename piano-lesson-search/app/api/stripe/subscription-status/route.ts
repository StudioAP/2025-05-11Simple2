export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

// Stripeインスタンスの初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

export async function GET() {
  try {
    // Supabaseクライアントを初期化
    const supabase = await createClient();

    // ユーザー認証情報を取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 }
      );
    }

    // ユーザーの教室情報を取得
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id, subscription_id, subscription_status")
      .eq("user_id", user.id)
      .single();

    if (schoolError) {
      console.error("教室情報取得エラー:", schoolError);
      return NextResponse.json(
        { error: "教室情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    if (!school) {
      return NextResponse.json(
        { error: "教室情報が見つかりません" },
        { status: 404 }
      );
    }

    // サブスクリプションIDがない場合
    if (!school.subscription_id) {
      return NextResponse.json({
        status: "inactive",
        message: "サブスクリプションが登録されていません",
      });
    }

    try {
      // Stripeからサブスクリプション情報を取得
      const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
        school.subscription_id
      );

      // サブスクリプションのステータスを確認
      let status = "inactive";
      let message = "サブスクリプションが無効です";

      if (subscription.status === "active") {
        status = "active";
        message = "サブスクリプションは有効です";
      } else if (subscription.status === "past_due") {
        status = "past_due";
        message = "お支払いが遅延しています";
      } else if (subscription.status === "canceled") {
        status = "canceled";
        message = "サブスクリプションはキャンセルされました";
      } else if (subscription.status === "unpaid") {
        status = "unpaid";
        message = "お支払いが確認できません";
      } else if (subscription.status === "trialing") {
        status = "trialing";
        message = "トライアル期間中です";
      }

      // データベースのステータスと異なる場合は更新
      if (school.subscription_status !== status) {
        const { error: updateError } = await supabase
          .from("schools")
          .update({ subscription_status: status })
          .eq("id", school.id);

        if (updateError) {
          console.error("サブスクリプションステータス更新エラー:", updateError);
        }
      }

      // 次回の請求日を取得
      // @ts-expect-error Property 'current_period_end' might exist on subscription but not be in the type.
      const nextBillingDate = new Date(subscription.current_period_end * 1000);
      const currentPeriodStart = new Date(
        // @ts-expect-error Property 'current_period_start' might exist on subscription but not be in the type.
        subscription.current_period_start * 1000
      );

      return NextResponse.json({
        status,
        message,
        subscription_id: subscription.id,
        current_period_start: currentPeriodStart,
        current_period_end: nextBillingDate,
        cancel_at_period_end: subscription.cancel_at_period_end,
      });
    } catch (stripeError) {
      console.error("Stripeサブスクリプション取得エラー:", stripeError);
      const stripeErrorMessage = stripeError instanceof Error ? stripeError.message : "サブスクリプション情報の取得に失敗しました";
      let stripeErrorCode: string | undefined;
      if (stripeError && typeof stripeError === 'object' && 'code' in stripeError) {
        stripeErrorCode = String(stripeError.code);
      }

      // サブスクリプションが見つからない場合
      if (stripeErrorCode === "resource_missing") {
        // データベースのサブスクリプション情報をクリア
        const { error: updateError } = await supabase
          .from("schools")
          .update({
            subscription_id: null,
            subscription_status: "inactive",
          })
          .eq("id", school.id);

        if (updateError) {
          console.error("サブスクリプション情報クリアエラー:", updateError);
        }

        return NextResponse.json({
          status: "inactive",
          message: "サブスクリプションが見つかりません",
        });
      }

      return NextResponse.json(
        {
          error: "サブスクリプション情報の取得に失敗しました",
          details: stripeErrorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("サブスクリプションステータス確認エラー:", error);
    const errorMessage = error instanceof Error ? error.message : "サブスクリプションステータスの確認中にエラーが発生しました";
    return NextResponse.json(
      {
        error: "サブスクリプションステータスの確認中にエラーが発生しました",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
