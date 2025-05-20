import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "当サイトについて | ピアノ・リトミック教室検索",
  description: "ピアノ・リトミック教室検索サイトの目的と利用方法についてご紹介します。",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">当サイトについて</h1>
      
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">サイトの目的</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            「ピアノ・リトミック教室検索」は、お子様や自分自身のための最適な音楽教育の場を見つけるためのプラットフォームです。
            全国のピアノ教室・リトミック教室の情報を簡単に検索でき、あなたのニーズに合った教室を見つけることができます。
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            教室を運営されている方は、当サイトに掲載することで、より多くの生徒さんとの出会いの機会を得ることができます。
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">ご利用方法</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">教室を探す方</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                トップページの検索フォームやナビゲーションメニューの「教室検索」から、キーワードやエリアで教室を検索できます。
                気になる教室が見つかったら、詳細ページから直接お問い合わせが可能です。
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">教室を掲載したい方</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                アカウント登録後、マイページから教室情報を登録することができます。
                写真やレッスン内容、料金などの詳細情報を掲載して、あなたの教室の魅力をアピールしましょう。
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">お問い合わせ</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            サイトの利用方法や掲載についてのご質問は、下記よりお問い合わせください。
          </p>
          <div className="flex justify-center">
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              お問い合わせはこちら
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
