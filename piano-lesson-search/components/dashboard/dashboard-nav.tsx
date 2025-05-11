"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: "ダッシュボード",
      href: "/dashboard",
    },
    {
      name: "教室情報",
      href: "/dashboard/school",
    },
    {
      name: "お知らせ",
      href: "/dashboard/announcement",
    },
    {
      name: "写真管理",
      href: "/dashboard/photos",
    },
    {
      name: "統計情報",
      href: "/dashboard/statistics",
    },
    {
      name: "プロフィール",
      href: "/dashboard/profile",
    },
    {
      name: "サブスクリプション",
      href: "/dashboard/subscription",
    },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              ピアノ・リトミック教室検索
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm rounded-md ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "ログアウト中..." : "ログアウト"}
            </Button>
          </div>
        </div>
      </div>

      {/* モバイルナビゲーション */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-xs text-center rounded-md ${
                pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
