"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail } from "lucide-react";

export function EmailVerificationStatus() {
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const supabase = createClient();

  // メール認証状態を確認
  useEffect(() => {
    async function checkEmailVerification() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // user.email_confirmed_atがnullでない場合は認証済み
          setIsEmailVerified(!!user.email_confirmed_at);
        }
      } catch (error) {
        console.error("メール認証状態確認エラー:", error);
      }
    }

    checkEmailVerification();
  }, [supabase]);

  // 認証メールを再送信
  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/dashboard`,
          },
        });
        
        if (error) {
          throw error;
        }
        
        setIsSent(true);
        // 3秒後にメッセージを非表示
        setTimeout(() => setIsSent(false), 5000);
      }
    } catch (error) {
      console.error("認証メール再送信エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 認証済みまたは読み込み中の場合は何も表示しない
  if (isEmailVerified === true || isEmailVerified === null) {
    return null;
  }

  return (
    <div className="mb-6">
      <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-400 ml-2">メールアドレスが未確認です</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300 ml-7">
          アカウントを完全に有効化するには、登録時に送信された確認メールのリンクをクリックしてください。
          メールが届いていない場合は、以下のボタンから再送信できます。
        </AlertDescription>
        
        <div className="mt-4 ml-7">
          {isSent ? (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300 ml-2 text-sm">
                確認メールを再送信しました。メールボックスをご確認ください。
              </AlertDescription>
            </Alert>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResendEmail} 
              disabled={isLoading}
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/30"
            >
              {isLoading ? "送信中..." : "確認メールを再送信"}
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}
