"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui";
import { formatStripeError } from "@/lib/stripe/client";
import { Loader2 } from "lucide-react";

type PaymentButtonProps = {
  userId: string;
  schoolName: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};

/**
 * 決済ボタンコンポーネント
 * Stripeの決済リンクを生成し、ユーザーを決済ページへ誘導します
 */
export function PaymentButton({ 
  userId, 
  schoolName, 
  onSuccess, 
  onError, 
  className = "",
  variant = "default"
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ユーザー情報が取得できませんでした。ログインし直してください。",
      });
      return;
    }

    if (!schoolName) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "教室情報が取得できませんでした。教室情報を登録してください。",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // サーバーサイドでStripe Payment Linksを生成
      const response = await fetch("/api/stripe/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, schoolName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "決済リンクの生成に失敗しました");
      }

      const { url } = await response.json();
      
      // 新しいタブで決済ページを開く
      window.open(url, "_blank");
      
      // 成功時のコールバック
      if (onSuccess) {
        onSuccess();
      }
      
      toast({
        title: "決済ページを開きました",
        description: "新しいタブで決済を完了してください。決済完了後、このページに戻ってきてください。",
      });
    } catch (error: any) {
      console.error("決済リンク生成エラー:", error);
      
      // エラー時のコールバック
      if (onError) {
        onError(error);
      }
      
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: formatStripeError(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          処理中...
        </>
      ) : (
        "サブスクリプションを開始する（月額500円）"
      )}
    </Button>
  );
}
