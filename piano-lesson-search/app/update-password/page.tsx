import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();

  // セッション情報を取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // パスワードリセットフローでない場合はホームにリダイレクト
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">新しいパスワードの設定</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            新しいパスワードを入力してください
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  );
}
