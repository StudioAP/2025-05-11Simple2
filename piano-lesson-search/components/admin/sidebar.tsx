"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  BarChart,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  {
    name: "ダッシュボード",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "サブスクリプション",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    name: "ユーザー管理",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "お知らせ管理",
    href: "/admin/announcements",
    icon: Bell,
  },
  {
    name: "統計情報",
    href: "/admin/statistics",
    icon: BarChart,
  },
  {
    name: "設定",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold">管理者パネル</h1>
        <p className="text-sm text-gray-500 mt-1">ピアノ・リトミック教室検索</p>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="px-6 py-4 mt-auto border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          ログアウト
        </Button>
      </div>
    </div>
  );
}
