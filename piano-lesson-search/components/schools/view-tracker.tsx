"use client";

import { useEffect } from "react";

type ViewTrackerProps = {
  schoolId: string;
};

export function ViewTracker({ schoolId }: ViewTrackerProps) {
  useEffect(() => {
    // ページ表示時に閲覧データを記録
    const recordView = async () => {
      try {
        await fetch("/api/schools/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ schoolId }),
        });
      } catch (error) {
        console.error("閲覧データ記録エラー:", error);
      }
    };

    // ページ表示から1秒後に閲覧データを記録（ボットやクローラーを除外するため）
    const timer = setTimeout(() => {
      recordView();
    }, 1000);

    return () => clearTimeout(timer);
  }, [schoolId]);

  // このコンポーネントは何も表示しない
  return null;
}
