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
};

export const geistSans = Inter({
  display: "swap",
  subsets: ["latin"],
});
