"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type School = {
  id: string;
  name: string;
  school_type_id: number;
  school_type_name: string;
  url: string;
  area: string;
  description: string;
  created_at?: string;
};

// Supabaseから返されるレスポンスの型
interface SchoolResponse {
  id: string;
  name: string;
  school_type_id: number;
  school_types: {
    name: string;
  };
  url: string;
  area: string;
  description: string;
  created_at?: string;
}

export function SearchResults({ keywords }: { keywords: string[] }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  // 1ページあたりの表示件数
  const PAGE_SIZE = 10;

  useEffect(() => {
    async function fetchSchools() {
      try {
        setLoading(true);
        setError(null);

        if (keywords.length === 0 && !searchParams.get('types') && !searchParams.get('areas')) {
          setSchools([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        // フィルターパラメータを取得
        const selectedTypes = searchParams.get('types')?.split(',').map(Number) || [];
        const selectedAreas = searchParams.get('areas')?.split(',') || [];
        const sortBy = searchParams.get('sort') || 'relevance';
        const page = parseInt(searchParams.get('page') || '1');
        setCurrentPage(page);

        // 検索条件を構築
        let queryCount = supabase
          .from('schools')
          .select('id', { count: 'exact' })
          .eq('is_published', true);

        let query = supabase
          .from('schools')
          .select(`
            id,
            name,
            school_type_id,
            school_types(name),
            url,
            area,
            description,
            created_at
          `)
          .eq('is_published', true)
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        // キーワード検索条件を追加
        if (keywords.length > 0) {
          const keywordConditions = keywords.map(keyword => 
            `name.ilike.%${keyword}%,area.ilike.%${keyword}%,description.ilike.%${keyword}%`
          ).join(',');
          
          queryCount = queryCount.or(keywordConditions);
          query = query.or(keywordConditions);
        }

        // 教室タイプでフィルタリング
        if (selectedTypes.length > 0) {
          queryCount = queryCount.in('school_type_id', selectedTypes);
          query = query.in('school_type_id', selectedTypes);
        }

        // エリアでフィルタリング
        if (selectedAreas.length > 0) {
          queryCount = queryCount.in('area', selectedAreas);
          query = query.in('area', selectedAreas);
        }

        // ソート順を適用
        switch (sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'name_asc':
            query = query.order('name', { ascending: true });
            break;
          case 'name_desc':
            query = query.order('name', { ascending: false });
            break;
          case 'relevance':
          default:
            // キーワードがある場合は関連度順（デフォルト）
            // キーワードがない場合は新着順
            if (keywords.length === 0) {
              query = query.order('created_at', { ascending: false });
            }
            break;
        }

        // 件数を取得
        const { count, error: countError } = await queryCount;
        
        if (countError) {
          throw countError;
        }
        
        setTotalCount(count || 0);

        // 検索結果を取得
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // 結果を整形
        const formattedData = data.map((school: any) => ({
          id: school.id,
          name: school.name,
          school_type_id: school.school_type_id,
          school_type_name: school.school_types.name,
          url: school.url,
          area: school.area,
          description: school.description,
          created_at: school.created_at
        }));

        setSchools(formattedData);
      } catch (err) {
        console.error('検索エラー:', err);
        setError('検索中にエラーが発生しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    }

    fetchSchools();
  }, [keywords, searchParams, PAGE_SIZE]);

  if (loading) {
    return <div className="text-center py-8">検索中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (schools.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">検索条件に一致する教室が見つかりませんでした。</p>
        <p className="text-gray-500 mb-6">別のキーワードで検索するか、フィルターを変更してみてください。</p>
        <div className="flex justify-center space-x-4">
          <Link href="/">
            <Button>トップページに戻る</Button>
          </Link>
          <Link href="/search">
            <Button variant="outline">フィルターをリセット</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ページネーションのリンクを生成する関数
  const generatePaginationLink = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/search?${params.toString()}`;
  };

  // 総ページ数を計算
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">{totalCount}件の教室が見つかりました（{currentPage}/{totalPages}ページ）</p>
      
      {schools.map((school) => (
        <div key={school.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{school.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
                  {school.school_type_name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {school.area}
                </span>
              </div>
              {school.url && (
                <a 
                  href={school.url.startsWith('http') ? school.url : `https://${school.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3 inline-block"
                >
                  ウェブサイトを見る
                </a>
              )}
              <p className="text-gray-700 dark:text-gray-300 mt-3">
                {school.description.length > 200 
                  ? `${school.description.substring(0, 200)}...` 
                  : school.description}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href={`/schools/${school.id}`}>
                <Button variant="outline">詳細を見る</Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Link 
            href={currentPage > 1 ? generatePaginationLink(currentPage - 1) : '#'}
            aria-disabled={currentPage <= 1}
            className={`p-2 rounded-md ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // 表示するページ番号を計算
            let pageNum: number;
            if (totalPages <= 5) {
              // 5ページ以下なら全部表示
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              // 現在のページが先頭付近なら1〜5を表示
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // 現在のページが末尾付近ならtotalPages-4〜totalPagesを表示
              pageNum = totalPages - 4 + i;
            } else {
              // それ以外なら現在のページを中心に前後2ページずつ表示
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Link 
                key={pageNum}
                href={generatePaginationLink(pageNum)}
                className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {pageNum}
              </Link>
            );
          })}
          
          <Link 
            href={currentPage < totalPages ? generatePaginationLink(currentPage + 1) : '#'}
            aria-disabled={currentPage >= totalPages}
            className={`p-2 rounded-md ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
