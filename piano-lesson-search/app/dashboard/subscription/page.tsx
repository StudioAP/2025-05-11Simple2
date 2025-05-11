import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { SubscriptionStatus } from "@/components/subscription";
import { Toaster } from "@/components/ui/toaster";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  
  // ユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 教室情報を取得
  const { data: schools } = await supabase
    .from("schools")
    .select("*")
    .eq("user_id", user.id);

  const school = schools && schools.length > 0 ? schools[0] : null;

  if (!school) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">サブスクリプション管理</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">教室情報が登録されていません</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            サブスクリプションを設定する前に、まずは教室情報を登録してください。
          </p>
          <Link href="/dashboard/school">
            <Button>教室情報を登録する</Button>
          </Link>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">サブスクリプション管理</h1>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">教室情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">教室名</p>
              <p className="font-medium">{school.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">公開状態</p>
              <p className="font-medium">
                {school.is_published ? (
                  <span className="text-green-600">公開中</span>
                ) : (
                  <span className="text-gray-600">非公開</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <SubscriptionStatus userId={user.id} school={school} />
        </div>

        <div className="text-sm text-gray-500">
          <p>※ サブスクリプションに関するご質問は、お問い合わせフォームからお願いします。</p>
          <p>※ 決済情報はStripeによって安全に管理されています。</p>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
