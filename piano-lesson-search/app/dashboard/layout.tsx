"use client"; // For usePathname

import { redirect, usePathname } from "next/navigation";
// We cannot use createClient from "@/utils/supabase/server" in a client component.
// Session checking needs to be re-evaluated or moved if this remains a client component.
// For now, let's assume session check might be handled by middleware or a higher-order component,
// or that this component is part of a route group that already ensures authentication.
// import { createClient } from "@/utils/supabase/server"; 
import DashboardNav from "@/components/dashboard/dashboard-nav";
import EmailVerificationStatus from "@/components/auth/email-verification-status";
import { Breadcrumbs } from "@/components/layout/breadcrumbs"; // Assuming this path is correct
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Use client-side Supabase

// Define a mapping for dashboard paths to labels
const dashboardPathLabels: { [key: string]: string } = {
  "/dashboard": "ダッシュボード概要",
  "/dashboard/school": "教室情報編集",
  "/dashboard/profile": "プロフィール設定",
  "/dashboard/photos": "写真管理",
  "/dashboard/announcement": "お知らせ管理",
  "/dashboard/subscription": "サブスクリプション",
  "/dashboard/statistics": "アクセス統計",
  // Add other paths as needed
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClient(); // Use client-side Supabase
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect("/login");
      } else {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, [supabase]);

  const breadcrumbItems = [
    { href: "/", label: "ホーム" },
    { href: "/dashboard", label: "ダッシュボード" }
  ];

  const currentPathLabel = dashboardPathLabels[pathname];
  if (pathname !== "/dashboard" && currentPathLabel) {
    breadcrumbItems.push({ label: currentPathLabel });
  } else if (pathname !== "/dashboard") {
    // Fallback for paths not in the map (e.g., dynamic sub-routes if any)
    // You might want to derive a label from the path or show a generic one
    const pathParts = pathname.split('/').filter(Boolean);
    const lastPart = pathParts.length > 1 ? pathParts[pathParts.length -1] : "ページ";
    const fallbackLabel = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    breadcrumbItems.push({ label: fallbackLabel });
  }
  
  if (!sessionChecked) {
    // Optionally, return a loading spinner or null while session is being checked
    return <div className="flex min-h-screen flex-col items-center justify-center"><p>Loading...</p></div>; 
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <div className="flex-1 container mx-auto py-8 px-4">
        <Breadcrumbs items={breadcrumbItems} containerClassName="mb-6 text-sm text-gray-500 dark:text-gray-400" />
        {/* メール認証状態の確認（クライアントコンポーネント） */}
        <EmailVerificationStatus />
        {children}
      </div>
    </div>
  );
}
