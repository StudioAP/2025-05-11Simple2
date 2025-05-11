import { createClient } from "@/utils/supabase/server";
import { AnnouncementForm } from "@/components/dashboard/announcement-form";

export default async function AnnouncementPage() {
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

  // お知らせを取得
  const { data: announcement } = await supabase
    .from("school_announcements")
    .select("*")
    .eq("school_id", school?.id || "")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!school) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">お知らせ管理</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">教室情報が登録されていません</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            お知らせを登録する前に、まずは教室情報を登録してください。
          </p>
          <a href="/dashboard/school" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            教室情報を登録する
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">お知らせ管理</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <AnnouncementForm 
          schoolId={school.id} 
          initialData={announcement || null} 
        />
      </div>
    </div>
  );
}
