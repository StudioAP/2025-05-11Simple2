import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ContactForm } from '@/components/schools/contact-form';
import { SchoolGallery } from "@/components/schools/school-gallery";
import { SchoolAnnouncement } from "@/components/schools/school-announcement";
import { PostgrestError } from "@supabase/supabase-js";

interface SchoolType {
  name: string;
}

interface School {
  id: string;
  name: string;
  school_types: SchoolType | null; // 'school_types(name)' で取得
  area: string | null;
  url: string | null;
  description: string | null;
  contact_email: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  // 必要に応じて他のカラムを追加
}

interface SchoolPhoto {
  id: string;
  school_id: string;
  photo_url: string;
  photo_order: number;
}

interface Announcement {
  id: string;
  school_id: string;
  title: string;
  content: string;
  created_at: string;
}

export default async function SchoolDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient();
  
  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select(`
      *,\n      school_types(name)\n    `)
    .eq("id", params.id)
    .eq("is_published", true)
    .single<School>();

  if (schoolError || !school) {
    notFound();
  }

  // 教室の写真を取得
  const { data: photos } = await supabase
    .from("school_photos")
    .select("*")
    .eq("school_id", params.id)
    .order("photo_order", { ascending: true }) as { data: SchoolPhoto[] | null; error: PostgrestError | null }; // 型アサーションを修正

  // お知らせを取得
  const { data: announcement } = await supabase
    .from("school_announcements")
    .select("*")
    .eq("school_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single<Announcement>();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{school.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm rounded-full">
                  {school.school_types?.name ?? 'タイプ未設定'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {school.area}
                </span>
              </div>
              {school.url && (
                <a
                  href={school.url.startsWith("http") ? school.url : `https://${school.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
                >
                  ウェブサイトを見る
                </a>
              )}
            </div>
          </div>

          {/* 教室写真ギャラリー */}
          {photos && photos.length > 0 && (
            <div className="my-8">
              <h2 className="text-xl font-semibold mb-4">教室の写真</h2>
              {/* @ts-expect-error IntrinsicAttributes のエラーを一時的に無視 */}
              <SchoolGallery photos={photos} />
            </div>
          )}

          {/* 教室詳細 */}
          <div className="my-8">
            <h2 className="text-xl font-semibold mb-4">教室詳細</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{school.description}</p>
            </div>
          </div>

          {/* お知らせ */}
          {announcement && (
            <div className="my-8">
              <h2 className="text-xl font-semibold mb-4">お知らせ</h2>
              {/* @ts-expect-error IntrinsicAttributes のエラーを一時的に無視 */}
              <SchoolAnnouncement announcement={announcement} />
            </div>
          )}

          {/* 問い合わせフォーム */}
          <div className="my-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">教室へのお問い合わせ</h2>
            <ContactForm 
              schoolId={params.id} 
              schoolName={school.name} 
              contactEmail={school.contact_email || ''} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
