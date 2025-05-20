import { Inter } from "next/font/google";

// NetlifyのプライマリURL、VercelのURL、ローカルホストの順でフォールバック
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || // Netlifyで設定するカスタム環境変数
  process.env.URL ||                  // Netlifyのビルド時URL (本番)
  process.env.DEPLOY_PRIME_URL ||     // Netlifyのビルド時URL (プレビューなど)
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || // Vercel用
  "http://localhost:3000";            // ローカル開発用

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "ピアノ・リトミック教室検索 | 最適な教室を見つけよう",
  description: "ピアノ教室やリトミック教室を簡単に検索できるサイトです。キーワードから最適な教室を見つけましょう。",
  keywords: "ピアノ教室,リトミック教室,音楽教室,ピアノレッスン,子供習い事,音楽レッスン",
  
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "ピアノ・リトミック教室検索",
    title: "ピアノ・リトミック教室検索 | 最適な教室を見つけよう",
    description: "ピアノ教室やリトミック教室を簡単に検索できるサイトです。キーワードから最適な教室を見つけましょう。",
    images: [
      {
        url: `${siteUrl}/images/ogp-image.png`,
        width: 1200,
        height: 630,
        alt: "ピアノ・リトミック教室検索",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ピアノ・リトミック教室検索 | 最適な教室を見つけよう",
    description: "ピアノ教室やリトミック教室を簡単に検索できるサイトです。キーワードから最適な教室を見つけましょう。",
    images: [`${siteUrl}/images/ogp-image.png`],
    creator: "@piano_search",
  },
};

export const geistSans = Inter({
  display: "swap",
  subsets: ["latin"],
});
