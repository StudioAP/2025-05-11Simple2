import Link from 'next/link';
import { Search, Users, Edit3 } from 'lucide-react'; // Example icons

export default function HowToUse() {
  return (
    <section className="my-12 p-6 md:p-8 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
        このサイトの使い方
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10 text-center">
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <Search className="h-10 w-10 text-primary mb-3" />
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">1. 探す</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            地域名（例：渋谷区）や学びたいこと（例：子供向け、初心者）などのキーワードで教室を検索。
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <Users className="h-10 w-10 text-primary mb-3" />
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">2. 見つける</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            気になる教室の詳細情報（レッスン内容、料金、アクセスなど）を確認。
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <Edit3 className="h-10 w-10 text-primary mb-3" />
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">3. 問い合わせる</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            興味のある教室に詳細ページから直接お問い合わせできます。
          </p>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600 text-center">
        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">教室を掲載したい運営者様へ</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          簡単な登録であなたの教室情報を掲載し、より多くの生徒さんにアピールできます。
        </p>
        <Link 
          href="/signup" 
          className="inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm transition-colors focus:ring-2 focus:ring-primary-focus focus:outline-none"
        >
          新規登録はこちら
        </Link>
      </div>
    </section>
  );
}
