import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
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
  const searchKeywords: string[] = [];

  // Standard keyword parameters
  const k1Param = searchParams.keyword1;
  const k2Param = searchParams.keyword2;
  const k3Param = searchParams.keyword3;
  
  // Fallback parameters from the main page search form
  const queryParam = searchParams.query; 
  const locationParam = searchParams.location;

  const firstKeyword = (k1Param && typeof k1Param === 'string' && k1Param.trim() !== "") 
    ? k1Param.trim() 
    : (queryParam && typeof queryParam === 'string' && queryParam.trim() !== "") 
    ? queryParam.trim() 
    : null;

  if (firstKeyword) {
    searchKeywords.push(firstKeyword);
  }

  const secondKeywordSource = (k2Param && typeof k2Param === 'string' && k2Param.trim() !== "") 
    ? k2Param.trim()
    : (locationParam && typeof locationParam === 'string' && locationParam.trim() !== "")
    ? locationParam.trim()
    : null;

  if (secondKeywordSource) {
    if (searchKeywords.length === 0 || (searchKeywords.length > 0 && searchKeywords[0] !== secondKeywordSource)) {
      searchKeywords.push(secondKeywordSource);
    }
  }
  
  if (k3Param && typeof k3Param === 'string' && k3Param.trim() !== "") {
    if (!searchKeywords.includes(k3Param.trim())) {
      searchKeywords.push(k3Param.trim());
    }
  }

  // Ensure we only take up to 3 unique keywords and filter out any empty strings
  const keywords = Array.from(new Set(searchKeywords.filter(kw => kw.trim() !== ""))).slice(0, 3);

  const breadcrumbItems = [
    { href: "/", label: "ホーム" },
    { label: "検索結果" }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs items={breadcrumbItems} />
      {/* JavaScriptが無効な環境用のフォールバックフォーム */}
      <noscript>
        {/* No h1 here, breadcrumbs are above. If a specific title is needed for noscript, it can be added. */}
        <h1 className="text-3xl font-bold my-4 text-center sr-only">教室検索 (フォールバック)</h1> 
        <form action="/search" method="get" className="mt-6 p-4 border rounded-lg bg-white dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="keyword1" className="block text-sm font-medium mb-1 dark:text-gray-300">キーワード</label>
              <input 
                type="text" 
                id="keyword1" 
                name="keyword1" 
                defaultValue={typeof searchParams.keyword1 === 'string' ? searchParams.keyword1 : ''}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="キーワードを入力（例：初心者、子供向け）"
              />
            </div>
            
            <div>
              <label htmlFor="area" className="block text-sm font-medium mb-1 dark:text-gray-300">エリア</label>
              <input 
                type="text" 
                id="area" 
                name="area" 
                defaultValue={typeof searchParams.area === 'string' ? searchParams.area : ''}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="地域名を入力"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">例: 渋谷区、横浜市</p>
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1 dark:text-gray-300">教室タイプ</label>
              <select 
                id="type" 
                name="type" 
                defaultValue={typeof searchParams.type === 'string' ? searchParams.type : ''}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">すべて</option>
                <option value="ピアノ教室">ピアノ教室</option>
                <option value="リトミック教室">リトミック教室</option>
                <option value="ピアノ・リトミック教室">ピアノ・リトミック教室</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-end">
            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded text-lg dark:bg-primary-dark dark:hover:bg-primary-dark/90">
              検索する
            </button>
          </div>
        </form>
        
        {/* サーバーサイドレンダリングされた検索結果 */}
        <ServerSearch searchParams={searchParams} />
      </noscript>
      
      {/* JavaScriptが有効な環境用の通常表示 */}
      <div className="js-only">
        {/* The h1 is now part of the SlideIn to match the js-only section's title styling */}
        <SlideIn direction="down" duration={500}>
           <h1 className="text-3xl font-bold mb-8 text-center dark:text-gray-100">検索結果</h1>
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
