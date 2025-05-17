import { createClient } from "@/utils/supabase/server";
import { SchoolForm } from "@/components/dashboard/school-form";

export default async function SchoolEditPage() {
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
    .select(`
      *,
      school_types(id, name)
    `)
    .eq("user_id", user.id);

  const school = schools && schools.length > 0 ? schools[0] : null;

  // 教室種別の一覧を取得
  const { data: schoolTypes } = await supabase
    .from("school_types")
    .select("*")
    .order("name");

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">教室情報の{school ? "編集" : "登録"}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <SchoolForm 
          initialData={school} 
          schoolTypes={schoolTypes || []} 
          userId={user.id} 
        />
      </div>
    </div>
  );
}
