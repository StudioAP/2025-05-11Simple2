import { createClient } from "@/utils/supabase/server";
import { PhotoManager } from "@/components/dashboard/photo-manager";

export default async function PhotosPage() {
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

  // 教室の写真を取得
  const { data: photos } = await supabase
    .from("school_photos")
    .select("*")
    .eq("school_id", school?.id || "")
    .order("photo_order", { ascending: true });

  if (!school) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">写真管理</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">教室情報が登録されていません</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            写真をアップロードする前に、まずは教室情報を登録してください。
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
      <h1 className="text-3xl font-bold mb-8">写真管理</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <PhotoManager 
          schoolId={school.id} 
          photos={photos || []} 
        />
      </div>
    </div>
  );
}
