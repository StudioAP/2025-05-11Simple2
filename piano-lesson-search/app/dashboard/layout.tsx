import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { EmailVerificationStatus } from "@/components/auth/email-verification-status";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // ユーザーのセッションを確認
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 未ログインの場合はログインページにリダイレクト
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <div className="flex-1 container mx-auto py-8 px-4">
        {/* メール認証状態の確認（クライアントコンポーネント） */}
        <EmailVerificationStatus />
        {children}
      </div>
    </div>
  );
}
