"use client";

import { CalendarDays, Eye, Users, MessageCircle } from "lucide-react";

type StatisticsOverviewProps = {
  viewCount: number;
  uniqueViewCount: number;
  contactCount: number;
  lastViewedAt: string | null;
  lastContactAt: string | null;
};

export function StatisticsOverview({
  viewCount,
  uniqueViewCount,
  contactCount,
  lastViewedAt,
  lastContactAt,
}: StatisticsOverviewProps) {
  // 日付フォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "なし";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const stats = [
    {
      title: "総閲覧数",
      value: viewCount.toLocaleString(),
      icon: Eye,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "ユニーク閲覧数",
      value: uniqueViewCount.toLocaleString(),
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "問い合わせ数",
      value: contactCount.toLocaleString(),
      icon: MessageCircle,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
            <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              最終閲覧日時
            </h3>
            <p className="text-base">{formatDate(lastViewedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900/20">
            <CalendarDays className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              最終問い合わせ日時
            </h3>
            <p className="text-base">{formatDate(lastContactAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
