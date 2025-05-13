import { Header } from "@/components/layout/header";
import { ThemeProvider } from "next-themes";
import { AccessibilityMenu } from "@/components/ui/accessibility-menu";
import { SkipLink } from "@/components/layout/skip-link";
import "./globals.css";
import { metadata, geistSans } from "./config";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
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
        </ThemeProvider>
      </body>
    </html>
  );
}
