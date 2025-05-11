/**
 * SEO最適化のためのユーティリティ関数
 */
import { Metadata } from 'next';

// デフォルトのメタデータ
const DEFAULT_TITLE = 'ピアノ・リトミック教室検索 | 最適な教室を見つけよう';
const DEFAULT_DESCRIPTION = 'ピアノ教室やリトミック教室を簡単に検索できるサイトです。キーワードから最適な教室を見つけましょう。';
const DEFAULT_KEYWORDS = 'ピアノ教室,リトミック教室,音楽教室,ピアノレッスン,子供,習い事';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://piano-lesson-search.vercel.app';

/**
 * 基本的なメタデータを生成する
 * @param title タイトル
 * @param description 説明
 * @param keywords キーワード
 * @param path パス
 * @returns Metadata オブジェクト
 */
export function generateBaseMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = '',
}: {
  title?: string;
  description?: string;
  keywords?: string;
  path?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'ピアノ・リトミック教室検索',
      locale: 'ja_JP',
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'ピアノ・リトミック教室検索',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * 教室詳細ページのメタデータを生成する
 * @param schoolName 教室名
 * @param schoolDescription 教室の説明
 * @param schoolArea 教室のエリア
 * @param schoolType 教室の種類
 * @param schoolId 教室ID
 * @returns Metadata オブジェクト
 */
export function generateSchoolMetadata({
  schoolName,
  schoolDescription,
  schoolArea,
  schoolType,
  schoolId,
}: {
  schoolName: string;
  schoolDescription: string;
  schoolArea: string;
  schoolType: string;
  schoolId: string;
}): Metadata {
  const title = `${schoolName} | ${schoolArea}の${schoolType} | ピアノ・リトミック教室検索`;
  const description = schoolDescription
    ? schoolDescription.substring(0, 160)
    : `${schoolArea}にある${schoolType}「${schoolName}」の詳細情報です。レッスン内容や料金、アクセス方法などをご確認いただけます。`;
  const keywords = `${schoolName},${schoolType},${schoolArea},ピアノ教室,リトミック教室,音楽教室`;
  const path = `/schools/${schoolId}`;

  return generateBaseMetadata({
    title,
    description,
    keywords,
    path,
  });
}

/**
 * 検索結果ページのメタデータを生成する
 * @param keywords 検索キーワード
 * @param area エリア
 * @param type 教室タイプ
 * @returns Metadata オブジェクト
 */
export function generateSearchMetadata({
  keywords,
  area,
  type,
}: {
  keywords: string[];
  area?: string;
  type?: string;
}): Metadata {
  const keywordText = keywords.length > 0 ? keywords.join('、') : '';
  const areaText = area ? `${area}の` : '';
  const typeText = type ? `${type}` : 'ピアノ・リトミック教室';
  
  const title = keywordText
    ? `${keywordText}に関する${areaText}${typeText}の検索結果 | ピアノ・リトミック教室検索`
    : `${areaText}${typeText}の検索結果 | ピアノ・リトミック教室検索`;
  
  const description = keywordText
    ? `${keywordText}に関する${areaText}${typeText}の検索結果です。最適な教室を見つけましょう。`
    : `${areaText}${typeText}の検索結果一覧です。お子様に最適な教室を見つけましょう。`;
  
  const keywordsStr = [
    ...keywords,
    type || 'ピアノ教室',
    type || 'リトミック教室',
    area || '音楽教室',
    '習い事',
    '子供',
  ].join(',');

  // 検索クエリパラメータを含むパスを生成
  let path = '/search?';
  if (keywords.length > 0) {
    keywords.forEach((keyword, index) => {
      path += `keyword${index + 1}=${encodeURIComponent(keyword)}&`;
    });
  }
  if (area) path += `area=${encodeURIComponent(area)}&`;
  if (type) path += `type=${encodeURIComponent(type)}&`;
  
  // 末尾の&を削除
  path = path.endsWith('&') ? path.slice(0, -1) : path;

  return generateBaseMetadata({
    title,
    description,
    keywords: keywordsStr,
    path,
  });
}
