"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function EmailVerificationStatus() {
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // メール認証状態を確認
  useEffect(() => {
    async function checkEmailVerification() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // user.email_confirmed_atがnullでない場合は認証済み
          setIsEmailVerified(!!user.email_confirmed_at);
          setUserEmail(user.email || null);
        }
      } catch (error) {
        console.error("メール認証状態確認エラー:", error);
      }
    }

    checkEmailVerification();

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user) {
        setIsEmailVerified(!!session.user.email_confirmed_at);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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
        // 5秒後にメッセージを非表示
        setTimeout(() => setIsSent(false), 5000);
        
        toast({
          title: "確認メールを送信しました",
          description: `${user.email}宛に確認メールを送信しました。メールボックスをご確認ください。`,
        });
      }
    } catch (error: any) {
      console.error("認証メール再送信エラー:", error);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error.message || "認証メールの送信に失敗しました。しばらくしてからもう一度お試しください。",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 認証状態を手動で更新
  const handleRefreshStatus = async () => {
    setIsLoading(true);
    try {
      // セッションを更新して最新の認証状態を取得
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session?.user) {
        setIsEmailVerified(!!session.user.email_confirmed_at);
        
        if (session.user.email_confirmed_at) {
          toast({
            title: "メール認証済み",
            description: "メールアドレスの認証が完了しています。",
          });
        }
      }
    } catch (error: any) {
      console.error("認証状態更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error.message || "認証状態の確認に失敗しました。",
      });
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
          {userEmail && (
            <p className="mt-1 font-medium">{userEmail} 宛に送信されています。</p>
          )}
          メールが届いていない場合は、以下のボタンから再送信できます。
        </AlertDescription>
        
        <div className="mt-4 ml-7 flex flex-wrap gap-2">
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
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  確認メールを再送信
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshStatus}
            disabled={isLoading}
            className="text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/30"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                認証状態を更新
              </>
            )}
          </Button>
        </div>
      </Alert>
    </div>
  );
}
