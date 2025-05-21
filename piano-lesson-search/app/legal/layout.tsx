"use client"; // Required for usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/breadcrumbs'; // Assuming this path is correct

// Metadata might need to be handled differently if this is a client component,
// or moved to individual page.tsx files if static generation is preferred for metadata.
// For now, let's keep it simple and focus on breadcrumbs.
// export const metadata: Metadata = {
//   title: '法的情報 | ピアノ・リトミック教室検索',
//   description: 'ピアノ・リトミック教室検索サービスの法的情報ページです。利用規約とプライバシーポリシーについてご確認いただけます。',
// };

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  let currentLabel = "法的情報";
  if (pathname === "/legal/terms") {
    currentLabel = "利用規約";
  } else if (pathname === "/legal/privacy") {
    currentLabel = "プライバシーポリシー";
  }

  const breadcrumbItems = [
    { href: "/", label: "ホーム" },
    { label: currentLabel }
  ];

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Breadcrumbs items={breadcrumbItems} />
      <nav className="mb-8">
        <ul className="flex space-x-6 border-b pb-4 dark:border-gray-700">
          <li>
            <Link 
              href="/legal/terms" 
              className="text-sm hover:underline text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-gray-200"
            >
              利用規約
            </Link>
          </li>
          <li>
            <Link 
              href="/legal/privacy" 
              className="text-sm hover:underline text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-gray-200"
            >
              プライバシーポリシー
            </Link>
          </li>
        </ul>
      </nav>
      <main className="prose prose-slate dark:prose-invert max-w-none">
        {children}
      </main>
    </div>
  );
} 