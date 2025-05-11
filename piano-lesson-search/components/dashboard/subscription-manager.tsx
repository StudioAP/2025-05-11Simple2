"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type School = {
  id: string;
  user_id: string;
  name: string;
  is_published: boolean;
};

type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

type SubscriptionManagerProps = {
  school: School;
};

export function SubscriptionManager({ school }: SubscriptionManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const supabase = createClient();

  // URLパラメータからサクセスメッセージを取得
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setSuccessMessage("サブスクリプションが正常に開始されました。教室情報が公開されました。");
      // 3秒後にメッセージを消す
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        router.replace("/dashboard/subscription");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // サブスクリプション情報を取得
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userData.user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("サブスクリプション取得エラー:", error);
          return;
        }

        setSubscription(data || null);
      } catch (err) {
        console.error("サブスクリプション取得エラー:", err);
      }
    }

    fetchSubscription();
  }, [supabase]);

  // サブスクリプションステータスの表示テキスト
  const getStatusDisplay = () => {
    if (!subscription) {
      return {
        title: "未登録",
        description: "サブスクリプションが設定されていません。サブスクリプションを開始して教室情報を公開しましょう。",
        color: "text-gray-600 dark:text-gray-400",
        badge: "bg-gray-200 text-gray-800",
      };
    }

    switch (subscription.status) {
      case "active":
        return {
          title: "公開中",
          description: "あなたの教室情報は現在公開されています。",
          color: "text-green-600 dark:text-green-400",
          badge: "bg-green-100 text-green-800",
        };
      case "past_due":
        return {
          title: "支払い遅延",
          description: "お支払いに問題が発生しています。決済情報を更新してください。",
          color: "text-yellow-600 dark:text-yellow-400",
          badge: "bg-yellow-100 text-yellow-800",
        };
      case "canceled":
        return {
          title: "キャンセル済み",
          description: "サブスクリプションはキャンセルされました。再開するには新たにお申し込みください。",
          color: "text-red-600 dark:text-red-400",
          badge: "bg-red-100 text-red-800",
        };
      default:
        return {
          title: "未設定",
          description: "サブスクリプションが設定されていません。",
          color: "text-gray-600 dark:text-gray-400",
          badge: "bg-gray-200 text-gray-800",
        };
    }
  };

  // サブスクリプション開始日・終了日の表示
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Stripe決済リンクへ遷移
  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("ユーザー情報が取得できませんでした");
      }

      // サーバーサイドでStripe Payment Linksを生成
      const response = await fetch("/api/stripe/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userData.user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "決済リンクの生成に失敗しました");
      }

      const { url } = await response.json();
      
      // 新しいタブで決済ページを開く
      window.open(url, "_blank");
    } catch (error: any) {
      console.error("決済リンク生成エラー:", error);
      alert(error.message || "決済リンクの生成中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  // サブスクリプションをキャンセル
  const handleCancel = async () => {
    if (!subscription || !subscription.stripe_subscription_id) {
      alert("キャンセルするサブスクリプションが見つかりません");
      return;
    }

    if (!confirm("サブスクリプションをキャンセルしますか？\n\nキャンセルすると、次回の更新日以降は教室情報が非公開になります。")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // サーバーサイドでStripeサブスクリプションをキャンセル
      const response = await fetch(`/api/stripe/cancel-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          subscriptionId: subscription.stripe_subscription_id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "サブスクリプションのキャンセルに失敗しました");
      }

      // ページをリロード
      router.refresh();
    } catch (error: any) {
      console.error("サブスクリプションキャンセルエラー:", error);
      alert(error.message || "サブスクリプションのキャンセル中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const { title, description, color, badge } = getStatusDisplay();

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">サブスクリプション状況</h2>
        <Badge className={badge}>{title}</Badge>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
      
      {subscription && subscription.status === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">開始日</p>
            <p>{formatDate(subscription.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">次回更新日</p>
            <p>{formatDate(subscription.current_period_end)}</p>
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium mb-4">プラン詳細</h3>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">月額プラン</span>
            <span className="text-xl font-bold">¥500 / 月</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              教室情報の公開
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              検索結果への表示
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              問い合わせフォームの利用
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              いつでもキャンセル可能
            </li>
          </ul>
        </div>
        
        {subscription && subscription.status === "active" ? (
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "処理中..." : "サブスクリプションをキャンセル"}
          </Button>
        ) : (
          <Button 
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "処理中..." : "サブスクリプションを開始する（月額500円）"}
          </Button>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          ※ サブスクリプションは毎月自動更新されます。<br />
          ※ キャンセルした場合、次回更新日以降に教室情報が非公開になります。
        </p>
      </div>
    </div>
  );
}
