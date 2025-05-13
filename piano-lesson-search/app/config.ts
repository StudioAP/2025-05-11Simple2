import { Inter } from "next/font/google";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ピアノ・リトミック教室検索 | 最適な教室を見つけよう",
  description: "ピアノ教室やリトミック教室を簡単に検索できるサイトです。キーワードから最適な教室を見つけましょう。",
};

export const geistSans = Inter({
  display: "swap",
  subsets: ["latin"],
});
