import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { StatisticsOverview } from "@/components/dashboard/statistics-overview";
import { DailyViewsChart } from "@/components/dashboard/daily-views-chart";
import { ContactList } from "@/components/dashboard/contact-list";

export default async function StatisticsPage() {
  const supabase = await createClient();

  // ユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 教室情報を取得
  const { data: schools } = await supabase
    .from("schools")
    .select("*")
    .eq("user_id", user.id);

  const school = schools && schools.length > 0 ? schools[0] : null;

  if (!school) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">統計情報</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">教室情報が登録されていません</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            統計情報を表示するには、まずは教室情報を登録してください。
          </p>
          <a href="/dashboard/school" className="text-blue-600 dark:text-blue-400 hover:underline">
            教室情報を登録する
          </a>
        </div>
      </div>
    );
  }

  // 閲覧数の統計情報を取得
  const { data: viewStats } = await supabase
    .from("school_view_counts")
    .select("*")
    .eq("school_id", school.id)
    .single();

  // 問い合わせ数の統計情報を取得
  const { data: contactStats } = await supabase
    .from("school_contact_counts")
    .select("*")
    .eq("school_id", school.id)
    .single();

  // 日別閲覧数データを取得（直近30日分）
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: dailyViews } = await supabase
    .from("school_daily_views")
    .select("*")
    .eq("school_id", school.id)
    .gte("view_date", thirtyDaysAgo.toISOString())
    .order("view_date", { ascending: true });

  // 最近の問い合わせを取得（最新10件）
  const { data: recentContacts } = await supabase
    .from("school_contacts")
    .select("*")
    .eq("school_id", school.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">統計情報</h1>
      
      <div className="space-y-8">
        {/* 統計情報の概要 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">概要</h2>
          <StatisticsOverview 
            viewCount={viewStats?.view_count || 0}
            uniqueViewCount={viewStats?.unique_view_count || 0}
            contactCount={contactStats?.contact_count || 0}
            lastViewedAt={viewStats?.last_viewed_at || null}
            lastContactAt={contactStats?.last_contact_at || null}
          />
        </div>
        
        {/* 日別閲覧数グラフ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">閲覧数の推移（過去30日間）</h2>
          <DailyViewsChart dailyViews={dailyViews || []} />
        </div>
        
        {/* 最近の問い合わせ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">最近の問い合わせ</h2>
          <ContactList contacts={recentContacts || []} />
        </div>
      </div>
    </div>
  );
}
