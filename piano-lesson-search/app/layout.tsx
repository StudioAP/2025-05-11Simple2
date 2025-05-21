import { Providers } from "@/components/providers";
import "./globals.css";
import { metadata as appConfigMetadata, geistSans } from "./config";
import ClientLayout from "./components/ClientLayout";

// config.ts からインポートしたメタデータをエクスポート
export const metadata = appConfigMetadata;

// 不要になった動的インポートとSkipLinkは削除
// const Header = dynamic(() => import('@/components/layout/header'), { ssr: false });
// const AccessibilityMenu = dynamic(() => import('@/components/ui/accessibility-menu'), { ssr: false });
// const Footer = dynamic(() => import('@/components/layout/footer'), { ssr: false });
// import SkipLink from "@/components/layout/skip-link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
