// 検索ページは常に最新データを取得するため、キャッシュを無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ページプロパティの型を定義
export interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// メタデータを動的に生成
export async function generateMetadata({ searchParams }: SearchPageProps) {
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
