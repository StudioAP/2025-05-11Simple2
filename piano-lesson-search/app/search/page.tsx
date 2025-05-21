import { Suspense } from "react";
import { SearchResults } from '@/components/search/search-results';
import { SearchFilters } from "@/components/search/search-filters";
import { SlideIn } from '@/components/ui/animations/slide-in'; 
import { PageLoader } from '@/components/ui/loading/page-loader';
import { ServerSearch } from "./server-search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "教室検索結果 | ピアノ・リトミック教室検索",
  description: "お近くのピアノ教室・リトミック教室を検索できます。",
};

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ 
  searchParams 
}: SearchPageProps) {
  // キーワードを取得
  const keywords = [];
  for (let i = 1; i <= 3; i++) {
    const keyword = searchParams[`keyword${i}`];
    if (keyword && typeof keyword === "string" && keyword.trim() !== "") {
      keywords.push(keyword.trim());
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* JavaScriptが無効な環境用のフォールバックフォーム */}
      <noscript>
        <h1 className="text-3xl font-bold mb-8 text-center">教室検索</h1>
        <form action="/search" method="get" className="mt-6 p-4 border rounded-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="keyword1" className="block text-sm font-medium mb-1">キーワード</label>
              <input 
                type="text" 
                id="keyword1" 
                name="keyword1" 
                defaultValue={typeof searchParams.keyword1 === 'string' ? searchParams.keyword1 : ''}
                className="w-full px-3 py-2 border rounded"
                placeholder="キーワードを入力"
              />
            </div>
            
            <div>
              <label htmlFor="area" className="block text-sm font-medium mb-1">エリア</label>
              <input 
                type="text" 
                id="area" 
                name="area" 
                defaultValue={typeof searchParams.area === 'string' ? searchParams.area : ''}
                className="w-full px-3 py-2 border rounded"
                placeholder="地域名を入力"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">教室タイプ</label>
              <select 
                id="type" 
                name="type" 
                defaultValue={typeof searchParams.type === 'string' ? searchParams.type : ''}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">すべて</option>
                <option value="ピアノ教室">ピアノ教室</option>
                <option value="リトミック教室">リトミック教室</option>
                <option value="ピアノ・リトミック教室">ピアノ・リトミック教室</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              検索する
            </button>
          </div>
        </form>
        
        {/* サーバーサイドレンダリングされた検索結果 */}
        <ServerSearch searchParams={searchParams} />
      </noscript>
      
      {/* JavaScriptが有効な環境用の通常表示 */}
      <div className="js-only">
        <SlideIn direction="down" duration={500}>
          <h1 className="text-3xl font-bold mb-8 text-center">検索結果</h1>
        </SlideIn>
        
        <SlideIn direction="up" duration={500} delay={100}>
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">検索キーワード</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.length > 0 ? (
              keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">キーワードが指定されていません</p>
            )}
          </div>
        </div>
        </SlideIn>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <SlideIn direction="left" duration={500} delay={200}>
              <SearchFilters />
            </SlideIn>
          </div>
          
          <div className="md:col-span-3">
            <Suspense fallback={<PageLoader message="検索結果を読み込み中..." />}>
              <SlideIn direction="right" duration={500} delay={300}>
                <SearchResults keywords={keywords} />
              </SlideIn>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
