import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const supabase = await createClient();

  // すでにログインしている場合はダッシュボードにリダイレクト
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">新規登録</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            教室運営者向けの新規登録ページです
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
