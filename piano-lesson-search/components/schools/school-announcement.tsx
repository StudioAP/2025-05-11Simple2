"use client";

import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

type Announcement = {
  id: string;
  school_id: string;
  content: string;
  photo_path: string | null;
  created_at: string;
};

type SchoolAnnouncementProps = {
  announcement: Announcement;
};

export function SchoolAnnouncement({ announcement }: SchoolAnnouncementProps) {
  const supabase = createClient();

  // Supabaseストレージから画像のURLを取得
  const getImageUrl = (path: string) => {
    if (!path) return null;
    const { data } = supabase.storage.from("announcement_photos").getPublicUrl(path);
    return data.publicUrl;
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">最新のお知らせ</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(announcement.created_at)}
        </span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-4">
        {announcement.content}
      </p>

      {announcement.photo_path && (
        <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden rounded-lg">
          <Image
            src={getImageUrl(announcement.photo_path) || ""}
            alt="お知らせの画像"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
