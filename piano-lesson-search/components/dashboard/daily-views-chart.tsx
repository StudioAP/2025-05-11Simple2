"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Chart.jsの必要なコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type DailyView = {
  school_id: string;
  view_date: string;
  view_count: number;
  unique_view_count: number;
};

type DailyViewsChartProps = {
  dailyViews: DailyView[];
};

export function DailyViewsChart({ dailyViews }: DailyViewsChartProps) {
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // 日付の範囲を作成（過去30日間）
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }

    // 日付をフォーマット
    const labels = dates.map((date) =>
      new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(date)
    );

    // 日付ごとのデータを初期化
    const viewCounts = new Array(30).fill(0);
    const uniqueViewCounts = new Array(30).fill(0);

    // データを日付ごとに集計
    dailyViews.forEach((dailyView) => {
      const viewDate = new Date(dailyView.view_date);
      viewDate.setHours(0, 0, 0, 0);
      
      dates.forEach((date, index) => {
        if (viewDate.getTime() === date.getTime()) {
          viewCounts[index] = dailyView.view_count;
          uniqueViewCounts[index] = dailyView.unique_view_count;
        }
      });
    });

    // グラフデータを設定
    setChartData({
      labels,
      datasets: [
        {
          label: "総閲覧数",
          data: viewCounts,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          tension: 0.2,
        },
        {
          label: "ユニーク閲覧数",
          data: uniqueViewCounts,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          tension: 0.2,
        },
      ],
    });
  }, [dailyViews]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <div className="h-[300px] w-full">
      {dailyViews.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          表示するデータがありません
        </div>
      )}
    </div>
  );
}
