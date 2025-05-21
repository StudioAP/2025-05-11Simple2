import Link from 'next/link';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs'; // Assuming breadcrumbs might be desired here too

export const metadata: Metadata = {
  title: "サイトマップ | ピアノ・リトミック教室検索",
  description: "ピアノ・リトミック教室検索サイトのサイトマップです。",
  robots: { // Good practice to noindex HTML sitemaps if you have an XML sitemap
    index: false,
    follow: true,
  }
};

export default function SitemapPage() {
  const breadcrumbItems = [
    { href: "/", label: "ホーム" },
    { label: "サイトマップ" }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-gray-100">サイトマップ</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">メイン</h2>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:underline text-primary dark:text-primary-light">ホーム</Link></li>
            <li><Link href="/search" className="hover:underline text-primary dark:text-primary-light">教室検索</Link></li>
            <li><Link href="/about" className="hover:underline text-primary dark:text-primary-light">このサイトについて</Link></li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">教室運営者様向け</h2>
          <ul className="space-y-2">
            <li><Link href="/login" className="hover:underline text-primary dark:text-primary-light">ログイン</Link></li>
            <li><Link href="/signup" className="hover:underline text-primary dark:text-primary-light">新規登録</Link></li>
            <li><Link href="/dashboard" className="hover:underline text-primary dark:text-primary-light">ダッシュボード (要ログイン)</Link></li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">法務情報</h2>
          <ul className="space-y-2">
            <li><Link href="/legal/terms" className="hover:underline text-primary dark:text-primary-light">利用規約</Link></li>
            <li><Link href="/legal/privacy" className="hover:underline text-primary dark:text-primary-light">プライバシーポリシー</Link></li>
          </ul>
        </section>
        
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">その他</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/contact" className="hover:underline text-primary dark:text-primary-light">
                お問い合わせ
              </Link>
            </li>
            {/* If an XML sitemap link is desired for users, it can be added here */}
            {/* <li><Link href="/sitemap.xml" className="hover:underline text-primary dark:text-primary-light">XMLサイトマップ (検索エンジン用)</Link></li> */}
          </ul>
        </section>
      </div>
    </div>
  );
}
