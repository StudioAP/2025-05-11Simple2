"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type DashboardStatsProps = {
  schoolId: string;
};

export function DashboardStats({ schoolId }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // 実際のアプリケーションでは、閲覧数や問い合わせ数を取得するためのテーブルを用意し、
        // そこからデータを取得する処理を実装します。
        // ここではダミーデータを表示します。
        
        // ダミーデータ
        const randomViews = Math.floor(Math.random() * 100) + 10;
        const randomInquiries = Math.floor(Math.random() * 10) + 1;
        
        setStats({
          totalViews: randomViews,
          totalInquiries: randomInquiries,
        });
      } catch (error) {
        console.error("統計情報の取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [schoolId]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">統計情報</h2>
      
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">閲覧数</p>
            <p className="text-2xl font-bold">{stats.totalViews}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">過去30日間</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">問い合わせ数</p>
            <p className="text-2xl font-bold">{stats.totalInquiries}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">過去30日間</p>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        ※ 統計情報は参考値です。実際の値とは異なる場合があります。
      </p>
    </div>
  );
}
