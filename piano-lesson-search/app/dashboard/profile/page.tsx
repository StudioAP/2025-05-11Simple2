import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PasswordChangeForm } from "@/components/dashboard/password-change-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // ユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // プロフィール情報を取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">プロフィール設定</h1>
      
      <div className="space-y-8">
        {/* プロフィール情報 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>
          <ProfileForm 
            userId={user.id} 
            email={user.email || ""}
            initialData={profile || null} 
          />
        </div>
        
        {/* パスワード変更 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">パスワード変更</h2>
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
}
