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
const Footer = dynamic(() => import('@/components/layout/footer'), { ssr: false });

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
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
