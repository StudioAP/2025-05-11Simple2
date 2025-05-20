"use client";

import React, { useCallback } from "react";
import Link from "next/link";

export default function Footer() {
  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-6 md:py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} ピアノ・リトミック教室検索 All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center space-x-2 md:space-x-4 mt-3">
          <Link 
            href="/legal/terms" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary hover:underline"
          >
            利用規約
          </Link>
          <Link 
            href="/legal/privacy" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary hover:underline"
          >
            プライバシーポリシー
          </Link>
        </div>
        <div className="mt-4">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500 hover:text-primary"
            aria-label="ページトップへ戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            ページトップへ戻る
          </button>
        </div>
        <div className="mt-3 flex justify-center items-center">
          <span className="text-xs text-gray-500 dark:text-gray-500 mr-1">Powered by</span>
          <a
            href="https://supabase.com"
            target="_blank"
            className="text-primary hover:underline inline-flex items-center"
            rel="noopener noreferrer"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0985H99.2578C107.355 40.0985 111.772 49.7581 106.093 55.9036L63.7076 110.284Z" fill="currentColor"/>
              <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0985H99.2578C107.355 40.0985 111.772 49.7581 106.093 55.9036L63.7076 110.284Z" fill="currentColor" fillOpacity="0.2"/>
              <path d="M45.317 2.07024C48.1765 -1.53064 53.9745 0.442315 54.0434 5.04075L55.0509 72.2559H9.76685C1.66931 72.2559 -2.74764 62.5963 2.93065 56.4508L45.317 2.07024Z" fill="currentColor"/>
            </svg>
            Supabase
          </a>
        </div>
      </div>
    </footer>
  );
}
