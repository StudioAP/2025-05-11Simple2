/**
 * 統計情報分析のためのユーティリティ関数
 */

import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 日付範囲を生成する
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 日付の配列
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * 日付をフォーマットする（YYYY-MM-DD）
 * @param date 日付
 * @returns フォーマットされた日付文字列
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 指定した日数前の日付を取得する
 * @param days 日数
 * @returns 指定した日数前の日付
 */
export function getDateBefore(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * 教室の閲覧統計を取得する
 * @param schoolId 教室ID
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 閲覧統計データ
 */
export async function getSchoolViewStats(
  schoolId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalViews: number;
  uniqueViews: number;
  dailyViews: { date: string; count: number; uniqueCount: number }[];
}> {
  try {
    // 総閲覧数を取得
    const { count: totalViews, error: totalError } = await supabase
      .from('school_views')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId)
      .gte('created_at', formatDate(startDate))
      .lte('created_at', formatDate(endDate));

    if (totalError) throw totalError;

    // ユニーク閲覧数を取得
    const { data: uniqueData, error: uniqueError } = await supabase
      .from('school_views')
      .select('ip_address')
      .eq('school_id', schoolId)
      .gte('created_at', formatDate(startDate))
      .lte('created_at', formatDate(endDate));

    if (uniqueError) throw uniqueError;

    const uniqueIps = new Set(uniqueData.map(item => item.ip_address));
    const uniqueViews = uniqueIps.size;

    // 日別の閲覧数を取得
    const { data: dailyData, error: dailyError } = await supabase
      .from('school_views')
      .select('created_at, ip_address')
      .eq('school_id', schoolId)
      .gte('created_at', formatDate(startDate))
      .lte('created_at', formatDate(endDate))
      .order('created_at', { ascending: true });

    if (dailyError) throw dailyError;

    // 日付範囲を生成
    const dateRange = generateDateRange(startDate, endDate);
    
    // 日別データを集計
    const dailyViews = dateRange.map(date => {
      const dateStr = formatDate(date);
      const dayViews = dailyData.filter(item => 
        formatDate(new Date(item.created_at)) === dateStr
      );
      
      const uniqueIpsForDay = new Set(dayViews.map(item => item.ip_address));
      
      return {
        date: dateStr,
        count: dayViews.length,
        uniqueCount: uniqueIpsForDay.size
      };
    });

    return {
      totalViews: totalViews || 0,
      uniqueViews,
      dailyViews
    };
  } catch (error) {
    console.error('Error fetching view stats:', error);
    return {
      totalViews: 0,
      uniqueViews: 0,
      dailyViews: []
    };
  }
}

/**
 * 教室の問い合わせ統計を取得する
 * @param schoolId 教室ID
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 問い合わせ統計データ
 */
export async function getSchoolContactStats(
  schoolId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalContacts: number;
  dailyContacts: { date: string; count: number }[];
  contactDetails: any[];
}> {
  try {
    // 総問い合わせ数を取得
    const { count: totalContacts, error: totalError } = await supabase
      .from('school_contacts')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId)
      .gte('created_at', formatDate(startDate))
      .lte('created_at', formatDate(endDate));

    if (totalError) throw totalError;

    // 問い合わせ詳細を取得
    const { data: contactDetails, error: detailsError } = await supabase
      .from('school_contacts')
      .select('*')
      .eq('school_id', schoolId)
      .gte('created_at', formatDate(startDate))
      .lte('created_at', formatDate(endDate))
      .order('created_at', { ascending: false });

    if (detailsError) throw detailsError;

    // 日付範囲を生成
    const dateRange = generateDateRange(startDate, endDate);
    
    // 日別データを集計
    const dailyContacts = dateRange.map(date => {
      const dateStr = formatDate(date);
      const dayContacts = contactDetails.filter(item => 
        formatDate(new Date(item.created_at)) === dateStr
      );
      
      return {
        date: dateStr,
        count: dayContacts.length
      };
    });

    return {
      totalContacts: totalContacts || 0,
      dailyContacts,
      contactDetails: contactDetails || []
    };
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return {
      totalContacts: 0,
      dailyContacts: [],
      contactDetails: []
    };
  }
}

/**
 * 閲覧から問い合わせへのコンバージョン率を計算する
 * @param viewCount 閲覧数
 * @param contactCount 問い合わせ数
 * @returns コンバージョン率（パーセント）
 */
export function calculateConversionRate(viewCount: number, contactCount: number): number {
  if (viewCount === 0) return 0;
  return (contactCount / viewCount) * 100;
}

/**
 * 統計データをCSV形式でエクスポートする
 * @param data エクスポートするデータ
 * @param columns カラム定義
 * @returns CSV文字列
 */
export function exportToCSV<T>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  // ヘッダー行
  const header = columns.map(column => column.label).join(',');
  
  // データ行
  const rows = data.map(item => {
    return columns.map(column => {
      const value = item[column.key];
      // 文字列に変換して、カンマを含む場合はダブルクォートで囲む
      const stringValue = String(value);
      return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
    }).join(',');
  });
  
  // ヘッダーとデータを結合
  return [header, ...rows].join('\n');
}

/**
 * 統計データをJSON形式でエクスポートする
 * @param data エクスポートするデータ
 * @returns JSON文字列
 */
export function exportToJSON<T>(data: T[]): string {
  return JSON.stringify(data, null, 2);
}
