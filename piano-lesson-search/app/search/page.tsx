import { Suspense } from "react";
import { SearchResults } from "@/components/search/search-results";
import { SearchFilters } from "@/components/search/search-filters";

// 検索ページは常に最新データを取得するため、キャッシュを無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// メタデータを動的に生成
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // キーワードを取得
  const keywords = [];
  for (let i = 1; i <= 3; i++) {
    const keyword = searchParams[`keyword${i}`];
    if (keyword && typeof keyword === "string" && keyword.trim() !== "") {
      keywords.push(keyword.trim());
    }
  }

  const keywordText = keywords.length > 0 
    ? keywords.join('、') 
    : "すべての教室";

  return {
    title: `${keywordText}の検索結果 | ピアノ・リトミック教室検索`,
    description: `${keywordText}に関するピアノ・リトミック教室の検索結果です。最適な教室を見つけましょう。`,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
      <h1 className="text-3xl font-bold mb-8 text-center">検索結果</h1>
      
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SearchFilters />
        </div>
        
        <div className="md:col-span-3">
          <Suspense fallback={<div className="text-center py-12">検索結果を読み込み中...</div>}>
            <SearchResults keywords={keywords} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
