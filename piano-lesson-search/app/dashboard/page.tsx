import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
// import { Suspense } from 'react'; // 未使用のためコメントアウト
// import SubscriptionStatus from '@/components/dashboard/subscription-status'; // Temporarily commented out
// import EmailVerificationStatusImproved from '@/components/auth/email-verification-status-improved'; // Temporarily commented out
// import UserProfileForm from '@/components/forms/user-profile-form'; // Placeholder will be created
import SlideIn from '@/components/ui/slide-in';
// import PageLoader from '@/components/ui/page-loader'; // 未使用のためコメントアウト
// import LoadingSpinner from '@/components/ui/loading'; // 未使用のためコメントアウト
// import { SlideIn } from '@/components/ui/animations';
import { FadeIn } from "@/components/ui/animations";

export default async function DashboardPage() {
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

  // 教室情報を取得
  const { data: schools } = await supabase
    .from("schools")
    .select(`
      *,
      school_types(name)
    `)
    .eq("user_id", user.id);

  const school = schools && schools.length > 0 ? schools[0] : null;

  return (
    <div className="space-y-8">
      <SlideIn direction="down" duration={500}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">マイページ</h1>
          {!school && (
            <Link href="/dashboard/school">
              <Button>教室情報を登録する</Button>
            </Link>
          )}
        </div>
      </SlideIn>

      {/* メール認証ステータス - Temporarily commented out
      <SlideIn direction="up" duration={500} delay={100}>
        <Suspense fallback={<PageLoader message="メール認証状況を確認中..." />}>
          <EmailVerificationStatusImproved />
        </Suspense>
      </SlideIn>
      */}

      {profile && (
        <SlideIn direction="up" duration={500} delay={200}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4">プロフィール</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">お名前</p>
              <p>{profile.full_name || "未設定"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">メールアドレス</p>
              <p>{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">電話番号</p>
              <p>{profile.phone || "未設定"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">住所</p>
              <p>{profile.address || "未設定"}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm">
                プロフィールを編集
              </Button>
            </Link>
          </div>
        </div>
        </SlideIn>
      )}

      {school ? (
        <>
          <SlideIn direction="up" duration={500} delay={300}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold">教室情報</h2>
              {/* <SubscriptionStatus status={school.subscription_status} /> */}{/* Temporarily commented out */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">教室名</p>
                <p className="font-medium">{school.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">教室種別</p>
                <p>{school.school_types?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">エリア</p>
                <p>{school.area}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ウェブサイト</p>
                <p>{school.url || "未設定"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">問い合わせ用メールアドレス</p>
                <p>{school.contact_email}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link href="/dashboard/school">
                <Button variant="outline" size="sm">
                  教室情報を編集
                </Button>
              </Link>
              {school.is_published ? (
                <Link href={`/schools/${school.id}`} target="_blank">
                  <Button variant="outline" size="sm">
                    公開ページを見る
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard/subscription">
                  <Button size="sm">
                    公開設定を行う
                  </Button>
                </Link>
              )}
            </div>
          </div>
          </SlideIn>
        </>
      ) : (
        <FadeIn duration={500} delay={300}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4">教室情報が登録されていません</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              教室情報を登録して、ピアノ・リトミック教室検索サイトに掲載しましょう。
            </p>
            <Link href="/dashboard/school">
              <Button>教室情報を登録する</Button>
            </Link>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
