"use client";

import dynamic from 'next/dynamic';
import SkipLink from "@/components/layout/skip-link";

const Header = dynamic(() => import('@/components/layout/header'), { ssr: false });
const AccessibilityMenu = dynamic(() => import('@/components/ui/accessibility-menu'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/footer'), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <AccessibilityMenu />
      <Footer />
    </div>
  );
} 