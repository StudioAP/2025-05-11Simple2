import { createClient } from "@/utils/supabase/server";
import { SubscriptionManagement } from "@/components/admin/subscription-management";

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();
  
  // サブスクリプション情報を取得（最新50件）
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      profiles:user_id (
        email
      ),
      schools!inner (
        id,
        name,
        is_published
      )
    `)
    .order("updated_at", { ascending: false })
    .limit(50);
  
  if (error) {
    console.error("サブスクリプション情報取得エラー:", error);
  }
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">サブスクリプション管理</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <SubscriptionManagement initialSubscriptions={subscriptions || []} />
      </div>
    </div>
  );
}
