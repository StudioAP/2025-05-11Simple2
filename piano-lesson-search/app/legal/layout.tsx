import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '法的情報 | ピアノ・リトミック教室検索',
  description: 'ピアノ・リトミック教室検索サービスの法的情報ページです。利用規約とプライバシーポリシーについてご確認いただけます。',
};

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <nav className="mb-8">
        <ul className="flex space-x-6 border-b pb-4">
          <li>
            <Link 
              href="/" 
              className="text-sm hover:underline text-muted-foreground hover:text-primary"
            >
              ホームに戻る
            </Link>
          </li>
          <li>
            <Link 
              href="/legal/terms" 
              className="text-sm hover:underline text-muted-foreground hover:text-primary"
            >
              利用規約
            </Link>
          </li>
          <li>
            <Link 
              href="/legal/privacy" 
              className="text-sm hover:underline text-muted-foreground hover:text-primary"
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