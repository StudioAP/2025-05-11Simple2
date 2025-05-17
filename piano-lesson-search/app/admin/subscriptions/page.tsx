// import { createClient } from "@/utils/supabase/server"; // 未使用のためコメントアウト
// import { SubscriptionManagement } from "@/components/admin/subscription-management"; // Temporarily commented out

export default async function AdminSubscriptionsPage() {
  // const supabase = await createClient(); // supabaseクライアントの初期化もコメントアウト
  
  // サブスクリプション情報を取得（最新50件） - 現在は SubscriptionManagement がコメントアウトされているため、データ取得もコメントアウト
  // const { data: subscriptions, error } = await supabase
  //   .from("subscriptions")
  //   .select(`
  //     *,
  //     profiles:user_id (
  //       email
  //     ),
  //     schools!inner (
  //       id,
  //       name,
  //       is_published
  //     )
  //   `)
  //   .order("updated_at", { ascending: false })
  //   .limit(50);
  
  // if (error) { // エラー処理も合わせてコメントアウト
  //   console.error("サブスクリプション情報取得エラー:", error);
  // }
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">サブスクリプション管理</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* <SubscriptionManagement initialSubscriptions={subscriptions || []} /> */}{/* Temporarily commented out */}
        <p className="text-center text-gray-500 py-8">現在、サブスクリプション管理機能は準備中です。</p>
      </div>
    </div>
  );
}
