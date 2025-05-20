import { Providers } from "@/components/providers";
// import Header from '@/components/layout/header';
// import AccessibilityMenu from '@/components/ui/accessibility-menu';
import SkipLink from "@/components/layout/skip-link";
import Link from "next/link";
import "./globals.css";
import { metadata as appConfigMetadata, geistSans } from "./config";
import dynamic from 'next/dynamic';

// config.ts からインポートしたメタデータをエクスポート
export const metadata = appConfigMetadata;

// 動的インポート
const Header = dynamic(() => import('@/components/layout/header'), { ssr: false });
const AccessibilityMenu = dynamic(() => import('@/components/ui/accessibility-menu'), { ssr: false });
const BackToTopButton = dynamic(() => import('../components/layout/back-to-top-button'), { ssr: false });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <SkipLink />
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <AccessibilityMenu />
            <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
              <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} ピアノ・リトミック教室検索 All rights reserved.
                </p>
                <div className="flex justify-center space-x-4 mt-3">
                  <Link 
                    href="/legal/terms" 
                    className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary hover:underline"
                  >
                    利用規約
                  </Link>
                  <Link 
                    href="/legal/privacy" 
                    className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary hover:underline"
                  >
                    プライバシーポリシー
                  </Link>
                </div>
                <div className="mt-4">
                  <BackToTopButton />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                  Powered by{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    className="text-primary hover:underline"
                    rel="noreferrer"
                  >
                    Supabase
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
