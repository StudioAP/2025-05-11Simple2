"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // バリデーション
    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      setIsLoading(false);
      return;
    }

    try {
      // 新規ユーザー登録（メール認証を有効化）
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/dashboard`,
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // プロフィール情報を保存
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            email: formData.email,
          });

        if (profileError) {
          throw profileError;
        }

        // 登録成功、メール確認待ち状態に
        setIsSuccess(true);
      }
    } catch (error: any) {
      console.error("登録エラー:", error);
      if (error.message.includes("already registered")) {
        setError("このメールアドレスはすでに登録されています");
      } else {
        setError("登録中にエラーが発生しました。もう一度お試しください。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 登録成功時のメッセージ表示
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-400 ml-2">登録が完了しました</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 ml-7">
            ご登録いただいたメールアドレスに確認メールを送信しました。<br />
            メール内のリンクをクリックして、アカウントを有効化してください。
          </AlertDescription>
        </Alert>
        <div className="text-center mt-8">
          <Link href="/login">
            <Button variant="outline">ログインページへ戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          登録後、ご入力いただいたメールアドレスに確認メールが送信されます。<br />
          メール内のリンクをクリックして、アカウントを有効化してください。
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="fullName">お名前</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="山田 太郎"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@example.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="8文字以上"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">パスワード（確認）</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="パスワードを再入力"
          required
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "登録中..." : "登録する"}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          すでにアカウントをお持ちの方は
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >
            ログイン
          </Link>
        </p>
      </div>
    </form>
  );
}
