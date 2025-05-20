import { searchSchools, SearchParams, SearchResult } from "@/lib/search-utils";
import { SchoolImage } from "@/components/school/school-image";

interface ServerSearchProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function ServerSearch({ searchParams }: ServerSearchProps) {
  const keywords: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const keywordParam = searchParams[`keyword${i}`];
    if (keywordParam && typeof keywordParam === 'string' && keywordParam.trim()) {
      keywords.push(keywordParam.trim());
    }
  }
  
  const area = typeof searchParams.area === 'string' ? searchParams.area : undefined;
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort as SearchParams['sort'] : 'relevance';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  
  const { data, total } = await searchSchools({
    keywords,
    area,
    type,
    sort,
    page,
    limit: 10
  });
  
  if (data.length === 0) {
    return (
      <div className="my-8 text-center">
        <h2 className="text-xl font-bold">検索結果</h2>
        <p className="mt-4">検索条件に一致する教室が見つかりませんでした。</p>
      </div>
    );
  }
  
  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">検索結果 ({total}件)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((school) => (
          <div key={school.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video relative">
              <SchoolImage
                schoolId={school.id}
                imagePath={`${school.id}/main.jpg`}
                width={400}
                height={225}
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-bold truncate">{school.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{school.area}</p>
              <p className="text-sm mt-2 line-clamp-2">{school.description}</p>
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{school.type}</span>
                <a href={`/schools/${school.id}`} className="text-sm text-blue-600 font-medium">
                  詳細を見る
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ページネーション */}
      <div className="mt-8 flex justify-center">
        <nav className="inline-flex gap-2">
          {page > 1 && (
            <a href={`/search?${new URLSearchParams({
              ...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => k !== 'page')),
              page: (page - 1).toString()
            })}`} className="px-3 py-2 border rounded bg-white hover:bg-gray-50">
              前へ
            </a>
          )}
          
          {total > page * 10 && (
            <a href={`/search?${new URLSearchParams({
              ...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => k !== 'page')),
              page: (page + 1).toString()
            })}`} className="px-3 py-2 border rounded bg-white hover:bg-gray-50">
              次へ
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
