"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
// import { Button } from "@/components/ui/button"; // 未使用のためコメントアウト
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    }

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              ピアノ・リトミック教室検索
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 text-sm rounded-md min-h-[44px] inline-flex items-center ${
                  pathname === "/"
                    ? "text-primary font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                }`}
              >
                ホーム
              </Link>
              <Link
                href="/search"
                className={`px-3 py-2 text-sm rounded-md min-h-[44px] inline-flex items-center ${
                  pathname.startsWith("/search")
                    ? "text-primary font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                }`}
              >
                教室検索
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 text-sm rounded-md min-h-[44px] inline-flex items-center ${
                  pathname === "/about"
                    ? "text-primary font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                }`}
              >
                当サイトについて
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 text-sm rounded-md min-h-[44px] inline-flex items-center ${
                    pathname.startsWith("/dashboard")
                      ? "text-primary font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                  }`}
                >
                  マイページ
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-3 py-2 text-sm rounded-md min-h-[44px] inline-flex items-center ${
                      pathname === "/login"
                        ? "text-primary font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                    }`}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className={`px-3 py-2 text-sm rounded-md min-h-[44px] inline-flex items-center ${
                      pathname === "/signup"
                        ? "text-primary font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                    }`}
                  >
                    新規登録
                  </Link>
                </>
              )}
            </nav>
            <ThemeSwitcher /> {/* Assuming ThemeSwitcher itself is 44x44 or has appropriate sizing */}
          </div>

          <div className="md:hidden flex items-center">
            <ThemeSwitcher /> {/* Assuming ThemeSwitcher itself is 44x44 or has appropriate sizing */}
            <button
              onClick={toggleMenu}
              className="ml-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="py-2 px-4 space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md min-h-[44px] flex items-center ${
                pathname === "/"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            <Link
              href="/search"
              className={`block px-3 py-2 rounded-md min-h-[44px] flex items-center ${
                pathname.startsWith("/search")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              教室検索
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-md min-h-[44px] flex items-center ${
                pathname === "/about"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              当サイトについて
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-md min-h-[44px] flex items-center ${
                  pathname.startsWith("/dashboard")
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                マイページ
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`block px-3 py-2 rounded-md min-h-[44px] flex items-center ${
                    pathname === "/login"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className={`block px-3 py-2 rounded-md min-h-[44px] flex items-center ${
                    pathname === "/signup"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
