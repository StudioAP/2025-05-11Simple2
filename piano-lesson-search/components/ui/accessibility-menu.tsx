"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Type,
  RotateCcw,
} from "lucide-react";
import { useTheme } from "next-themes";

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const [fontSize, setFontSize] = useState(100);
  const [mounted, setMounted] = useState(false);

  // テーマの変更が可能になるまでマウント状態を確認
  useEffect(() => {
    setMounted(true);
  }, []);

  // フォントサイズを変更する
  const changeFontSize = (increase: boolean) => {
    if (increase && fontSize < 150) {
      setFontSize(fontSize + 10);
      document.documentElement.style.fontSize = `${fontSize + 10}%`;
    } else if (!increase && fontSize > 80) {
      setFontSize(fontSize - 10);
      document.documentElement.style.fontSize = `${fontSize - 10}%`;
    }
  };

  // フォントサイズをリセットする
  const resetFontSize = () => {
    setFontSize(100);
    document.documentElement.style.fontSize = "100%";
  };

  // テーマを切り替える
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  // アクセシビリティメニューを開閉する
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMenu}
        aria-label="アクセシビリティメニューを開く"
        className="bg-white dark:bg-gray-800 shadow-md"
      >
        <Accessibility className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-64 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3">アクセシビリティ設定</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">文字サイズ</h3>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeFontSize(false)}
                  aria-label="文字サイズを小さくする"
                  disabled={fontSize <= 80}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{fontSize}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeFontSize(true)}
                  aria-label="文字サイズを大きくする"
                  disabled={fontSize >= 150}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFontSize}
                  aria-label="文字サイズをリセットする"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">テーマ</h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "ライトモードに切り替える" : "ダークモードに切り替える"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 mr-2" />
                ) : (
                  <Moon className="h-4 w-4 mr-2" />
                )}
                {theme === "dark" ? "ライトモード" : "ダークモード"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
