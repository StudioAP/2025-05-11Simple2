import { SearchForm } from "@/components/search/search-form";

export default async function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl mb-4">
            ピアノ・リトミック教室<span className="text-primary">検索</span>
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
            お近くのピアノ教室・リトミック教室を簡単に検索できます。<br />
            キーワードを入力して、あなたにぴったりの教室を見つけましょう。
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">教室を検索</h2>
          <SearchForm />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">簡単検索</h3>
            <p className="text-gray-600 dark:text-gray-400">キーワードを入力するだけで、あなたの条件に合った教室が見つかります。</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">豊富な情報</h3>
            <p className="text-gray-600 dark:text-gray-400">教室の詳細情報や写真を確認して、安心して問い合わせができます。</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">直接問い合わせ</h3>
            <p className="text-gray-600 dark:text-gray-400">気になる教室には、サイト内のフォームから直接問い合わせができます。</p>
          </div>
        </div>
      </main>
    </div>
  );
}
