import { Suspense } from "react";
import { SearchResults } from "@/components/search/search-results";
import { SearchFilters } from "@/components/search/search-filters";
import { PageLoader } from "@/components/ui/loading";
import { SlideIn } from "@/components/ui/animations";

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
  );
}
