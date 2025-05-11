/**
 * 検索機能強化のためのユーティリティ関数
 */

import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 検索パラメータの型定義
 */
export interface SearchParams {
  keywords: string[];
  area?: string;
  type?: string;
  sort?: 'relevance' | 'newest' | 'name';
  page?: number;
  limit?: number;
}

/**
 * 検索結果の型定義
 */
export interface SearchResult {
  id: string;
  name: string;
  description: string;
  area: string;
  type: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  website_url?: string;
  is_verified: boolean;
  view_count: number;
}

/**
 * キーワードから教室を検索する
 * @param params 検索パラメータ
 * @returns 検索結果と総件数
 */
export async function searchSchools(
  params: SearchParams
): Promise<{ data: SearchResult[]; total: number }> {
  try {
    const {
      keywords,
      area,
      type,
      sort = 'relevance',
      page = 1,
      limit = 10
    } = params;

    // 検索クエリの構築
    let query = supabase
      .from('schools')
      .select('*, school_views(count)', { count: 'exact' })
      .eq('is_published', true);

    // キーワード検索
    if (keywords.length > 0) {
      // 各キーワードに対してOR条件を構築
      const keywordConditions = keywords.map(keyword => {
        const likePattern = `%${keyword}%`;
        return `name.ilike.${likePattern},description.ilike.${likePattern},area.ilike.${likePattern}`;
      });

      // OR条件を適用
      query = query.or(keywordConditions.join(','));
    }

    // エリアでフィルタリング
    if (area) {
      query = query.ilike('area', `%${area}%`);
    }

    // 教室タイプでフィルタリング
    if (type) {
      query = query.eq('type', type);
    }

    // ソート順の適用
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'relevance':
      default:
        // キーワードが指定されている場合は関連度順、それ以外は新着順
        if (keywords.length > 0) {
          // 関連度順のソートロジックは実際にはより複雑になる可能性がある
          query = query.order('created_at', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }
        break;
    }

    // ページネーション
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // クエリの実行
    const { data, error, count } = await query;

    if (error) throw error;

    // ビュー数の集計
    const processedData = data.map(school => {
      const viewCount = school.school_views?.reduce((sum: number, view: any) => sum + view.count, 0) || 0;
      
      return {
        ...school,
        view_count: viewCount,
        school_views: undefined // 不要なネストデータを削除
      };
    });

    return {
      data: processedData,
      total: count || 0
    };
  } catch (error) {
    console.error('Error searching schools:', error);
    return {
      data: [],
      total: 0
    };
  }
}

/**
 * 検索結果をハイライトする
 * @param text 対象テキスト
 * @param keywords ハイライトするキーワード
 * @returns ハイライト済みテキスト（HTML）
 */
export function highlightText(text: string, keywords: string[]): string {
  if (!text || keywords.length === 0) return text;

  let highlightedText = text;
  
  keywords.forEach(keyword => {
    if (!keyword.trim()) return;
    
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
}

/**
 * テキストを指定した長さで切り詰める
 * @param text 対象テキスト
 * @param maxLength 最大長
 * @returns 切り詰めたテキスト
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * 検索クエリからURLパラメータを生成する
 * @param params 検索パラメータ
 * @returns URLパラメータ文字列
 */
export function buildSearchQueryString(params: SearchParams): string {
  const queryParams = new URLSearchParams();
  
  // キーワードの追加
  params.keywords.forEach((keyword, index) => {
    if (keyword.trim()) {
      queryParams.append(`keyword${index + 1}`, keyword);
    }
  });
  
  // その他のパラメータの追加
  if (params.area) queryParams.append('area', params.area);
  if (params.type) queryParams.append('type', params.type);
  if (params.sort && params.sort !== 'relevance') queryParams.append('sort', params.sort);
  if (params.page && params.page > 1) queryParams.append('page', params.page.toString());
  
  return queryParams.toString();
}

/**
 * URLパラメータから検索パラメータを解析する
 * @param queryString URLクエリ文字列
 * @returns 検索パラメータ
 */
export function parseSearchParams(queryString: string): SearchParams {
  const params = new URLSearchParams(queryString);
  const keywords: string[] = [];
  
  // キーワードの取得
  for (let i = 1; i <= 3; i++) {
    const keyword = params.get(`keyword${i}`);
    if (keyword && keyword.trim()) {
      keywords.push(keyword.trim());
    }
  }
  
  // その他のパラメータの取得
  const area = params.get('area') || undefined;
  const type = params.get('type') || undefined;
  const sort = params.get('sort') as SearchParams['sort'] || 'relevance';
  const page = parseInt(params.get('page') || '1', 10);
  
  return {
    keywords,
    area,
    type,
    sort,
    page: isNaN(page) ? 1 : page,
    limit: 10
  };
}

/**
 * 教室タイプの選択肢を取得する
 * @returns 教室タイプの選択肢
 */
export async function getSchoolTypes(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('type')
      .eq('is_published', true)
      .order('type', { ascending: true });
    
    if (error) throw error;
    
    // 重複を除去
    const uniqueTypes = [...new Set(data.map(item => item.type))];
    return uniqueTypes.filter(Boolean); // null/undefinedを除外
  } catch (error) {
    console.error('Error fetching school types:', error);
    return [];
  }
}

/**
 * エリアの選択肢を取得する
 * @returns エリアの選択肢
 */
export async function getSchoolAreas(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('area')
      .eq('is_published', true)
      .order('area', { ascending: true });
    
    if (error) throw error;
    
    // 重複を除去
    const uniqueAreas = [...new Set(data.map(item => item.area))];
    return uniqueAreas.filter(Boolean); // null/undefinedを除外
  } catch (error) {
    console.error('Error fetching school areas:', error);
    return [];
  }
}
