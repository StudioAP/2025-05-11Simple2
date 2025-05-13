"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Receipt, AlertCircle } from "lucide-react";

interface PaymentHistoryProps {
  userId: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  created: string;
  invoice_pdf?: string | null;
}

export function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchPaymentHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // サブスクリプション情報を取得
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id, stripe_subscription_id")
        .eq("user_id", userId)
        .single();
      
      if (subError && subError.code !== "PGRST116") {
        console.error("サブスクリプション情報取得エラー:", subError);
        return;
      }
      
      if (!subscription?.stripe_customer_id) {
        // サブスクリプションがない場合は空の配列を設定
        setPayments([]);
        return;
      }
      
      // 決済履歴を取得
      const response = await fetch(`/api/stripe/payment-history?customerId=${subscription.stripe_customer_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "決済履歴の取得に失敗しました");
      }
      
      const { data } = await response.json();
      setPayments(data || []);
    } catch (error: any) {
      console.error("決済履歴取得エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "決済履歴の取得に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, toast]);

  // 決済履歴を取得
  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  // 手動更新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPaymentHistory();
    setIsRefreshing(false);
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 金額をフォーマット
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  // 支払い状況に応じたラベルとスタイルを取得
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "succeeded":
        return {
          label: "支払い完了",
          className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        };
      case "pending":
        return {
          label: "処理中",
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        };
      case "failed":
        return {
          label: "失敗",
          className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        };
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">決済履歴</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="sr-only">更新</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">決済履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const { label, className } = getStatusDisplay(payment.status);
              return (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatDate(payment.created)}</p>
                    <p className="text-sm text-gray-500">{formatAmount(payment.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${className}`}>
                      {label}
                    </span>
                  </div>
                  {payment.invoice_pdf && (
                    <a 
                      href={payment.invoice_pdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      領収書
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
