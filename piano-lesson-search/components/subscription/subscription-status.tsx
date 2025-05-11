"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, useToast } from "@/components/ui";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { PaymentButton } from "./payment-button";
import { formatStripeError } from "@/lib/stripe/client";

interface School {
  id: string;
  name: string;
}

interface SubscriptionStatusProps {
  userId: string;
  school?: School | null;
  onRefresh?: () => void;
}

export function SubscriptionStatus({ userId, school, onRefresh }: SubscriptionStatusProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // サブスクリプション情報を取得
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .single();
        
        if (error && error.code !== "PGRST116") { // PGRST116は「結果が見つからない」エラー
          console.error("サブスクリプション情報取得エラー:", error);
          toast({
            variant: "destructive",
            title: "エラー",
            description: "サブスクリプション情報の取得に失敗しました。",
          });
          return;
        }
        
        if (data) {
          setStatus(data.status);
          setSubscriptionId(data.stripe_subscription_id);
          
          // 期限日をフォーマット
          if (data.current_period_end) {
            const date = new Date(data.current_period_end);
            setExpiryDate(
              date.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            );
          }
        } else {
          // サブスクリプションが見つからない場合はnullに設定
          setStatus(null);
          setSubscriptionId(null);
          setExpiryDate(null);
        }
      } catch (error) {
        console.error("サブスクリプション情報取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, [userId, supabase, toast]);

  // 手動更新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "ユーザー情報が取得できませんでした。ログインし直してください。",
        });
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      if (data) {
        setStatus(data.status);
        setSubscriptionId(data.stripe_subscription_id);
        
        if (data.current_period_end) {
          const date = new Date(data.current_period_end);
          setExpiryDate(
            date.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          );
        }
      } else {
        setStatus(null);
        setSubscriptionId(null);
        setExpiryDate(null);
      }
      
      if (onRefresh) {
        onRefresh();
      }
      
      toast({
        title: "更新完了",
        description: "サブスクリプション情報を更新しました",
      });
    } catch (error) {
      console.error("更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "情報の更新に失敗しました。もう一度お試しください。",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // サブスクリプションをキャンセル
  const handleCancel = async () => {
    if (!subscriptionId) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "キャンセルするサブスクリプションが見つかりません",
      });
      return;
    }
    
    if (!confirm("サブスクリプションをキャンセルしますか？\n\nキャンセルすると、次回の更新日以降は教室情報が非公開になります。")) {
      return;
    }
    
    try {
      setIsCancelling(true);
      
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "サブスクリプションのキャンセルに失敗しました");
      }
      
      // ステータスを更新
      setStatus("canceled");
      
      toast({
        title: "キャンセル完了",
        description: "サブスクリプションは期限日をもって終了します",
      });
    } catch (error: any) {
      console.error("サブスクリプションキャンセルエラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: formatStripeError(error),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // ステータスに基づいて表示内容を決定
  const renderStatusContent = () => {
    if (isLoading) {
      return (
        <CardContent className="flex justify-center items-center py-8">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            <p>読み込み中...</p>
          </div>
        </CardContent>
      );
    }

    if (!status || status === "canceled" || status === "unpaid") {
      return (
        <>
          <CardHeader>
            <CardTitle className="text-center">教室情報を公開する</CardTitle>
            <CardDescription className="text-center">
              月額500円で教室情報を公開できます
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-500 mr-2" />
              <p className="text-lg">現在、教室情報は非公開です</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              サブスクリプションに登録すると、教室情報が検索結果に表示されるようになります。
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4 text-left mx-auto max-w-xs">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                教室情報の公開
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                検索結果への表示
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                問い合わせフォームの利用
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                いつでもキャンセル可能
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-center">
            <PaymentButton 
              userId={userId} 
              schoolName={school?.name || ""} 
              className="w-full"
              onSuccess={handleRefresh}
            />
          </CardFooter>
        </>
      );
    }

    if (status === "active") {
      return (
        <>
          <CardHeader>
            <CardTitle className="text-center">サブスクリプション状況</CardTitle>
            <CardDescription className="text-center">
              教室情報は公開されています
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
              <p className="text-lg">アクティブ</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-500 mb-2">
                月額: 500円（税込）
              </p>
              {expiryDate && (
                <p className="text-sm text-gray-500">
                  次回更新日: {expiryDate}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              ※ サブスクリプションは毎月自動更新されます。<br />
              ※ キャンセルした場合、次回更新日以降に教室情報が非公開になります。
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full"
            >
              {isCancelling ? "処理中..." : "サブスクリプションを解約する"}
            </Button>
          </CardFooter>
        </>
      );
    }

    if (status === "past_due") {
      return (
        <>
          <CardHeader>
            <CardTitle className="text-center">お支払いに問題があります</CardTitle>
            <CardDescription className="text-center">
              決済に失敗しました
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
              <p className="text-lg">支払い期限超過</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              お支払い方法を更新して、教室情報の公開を継続してください。
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <PaymentButton 
              userId={userId} 
              schoolName={school?.name || ""} 
              className="w-full"
              onSuccess={handleRefresh}
            />
          </CardFooter>
        </>
      );
    }

    return (
      <CardContent className="text-center py-4">
        <p>ステータス: {status}</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="mt-2"
        >
          {isRefreshing ? "更新中..." : "情報を更新"}
        </Button>
      </CardContent>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {renderStatusContent()}
    </Card>
  );
}
