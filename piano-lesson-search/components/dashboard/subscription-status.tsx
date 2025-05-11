"use client";

type SubscriptionStatusProps = {
  status: string;
};

export function SubscriptionStatus({ status }: SubscriptionStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case "active":
        return {
          label: "公開中",
          color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        };
      case "inactive":
        return {
          label: "非公開",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        };
      case "past_due":
        return {
          label: "支払い遅延",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        };
      case "canceled":
        return {
          label: "キャンセル済み",
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
      default:
        return {
          label: "未設定",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        };
    }
  };

  const { label, color } = getStatusDisplay();

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
