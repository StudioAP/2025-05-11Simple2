"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LiveRegion } from "@/components/ui/accessibility";
import { handleKeyboardActivation } from "@/lib/accessibility";
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  RotateCcw,
  Contrast,
  ArrowLeftRight,
} from "lucide-react";
import { useTheme } from "next-themes";

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // テーマの変更が可能になるまでマウント状態を確認
  useEffect(() => {
    setMounted(true);
  }, []);

  // フォントサイズを変更する
  const changeFontSize = (increase: boolean) => {
    if (increase && fontSize < 150) {
      const newSize = fontSize + 10;
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}%`;
      setStatusMessage(`文字サイズを${newSize}%に変更しました`);
    } else if (!increase && fontSize > 80) {
      const newSize = fontSize - 10;
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}%`;
      setStatusMessage(`文字サイズを${newSize}%に変更しました`);
    }
  };

  // コントラストを変更する
  const changeContrast = (increase: boolean) => {
    if (increase && contrast < 150) {
      const newContrast = contrast + 10;
      setContrast(newContrast);
      document.documentElement.style.filter = `contrast(${newContrast}%)`;
      setStatusMessage(`コントラストを${newContrast}%に変更しました`);
    } else if (!increase && contrast > 80) {
      const newContrast = contrast - 10;
      setContrast(newContrast);
      document.documentElement.style.filter = `contrast(${newContrast}%)`;
      setStatusMessage(`コントラストを${newContrast}%に変更しました`);
    }
  };

  // 文字間隔を変更する
  const changeLetterSpacing = (increase: boolean) => {
    if (increase && letterSpacing < 5) {
      const newSpacing = letterSpacing + 0.5;
      setLetterSpacing(newSpacing);
      document.body.style.letterSpacing = `${newSpacing}px`;
      setStatusMessage(`文字間隔を${newSpacing}pxに変更しました`);
    } else if (!increase && letterSpacing > 0) {
      const newSpacing = letterSpacing - 0.5;
      setLetterSpacing(newSpacing);
      document.body.style.letterSpacing = `${newSpacing}px`;
      setStatusMessage(`文字間隔を${newSpacing}pxに変更しました`);
    }
  };

  // 設定をリセットする
  const resetSettings = () => {
    setFontSize(100);
    setContrast(100);
    setLetterSpacing(0);
    document.documentElement.style.fontSize = "100%";
    document.documentElement.style.filter = "contrast(100%)";
    document.body.style.letterSpacing = "0px";
    setStatusMessage("すべての設定をリセットしました");
  };

  // テーマを切り替える
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      setStatusMessage("ライトモードに切り替えました");
    } else {
      setTheme("dark");
      setStatusMessage("ダークモードに切り替えました");
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
        onKeyDown={(e) => handleKeyboardActivation(e, toggleMenu)}
        aria-label="アクセシビリティメニューを開く"
        aria-expanded={isOpen}
        aria-controls="accessibility-menu"
        className="bg-white dark:bg-gray-800 shadow-md"
      >
        <Accessibility className="h-5 w-5" />
      </Button>
      
      <LiveRegion message={statusMessage} ariaLive="polite" />

      {isOpen && (
        <div 
          id="accessibility-menu"
          className="absolute bottom-14 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-72 border border-gray-200 dark:border-gray-700"
          role="dialog"
          aria-labelledby="accessibility-title"
        >
          <h2 id="accessibility-title" className="text-lg font-semibold mb-3">アクセシビリティ設定</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">文字サイズ</h3>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeFontSize(false)}
                  onKeyDown={(e) => handleKeyboardActivation(e, () => changeFontSize(false))}
                  aria-label="文字サイズを小さくする"
                  disabled={fontSize <= 80}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm" aria-live="polite">{fontSize}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeFontSize(true)}
                  onKeyDown={(e) => handleKeyboardActivation(e, () => changeFontSize(true))}
                  aria-label="文字サイズを大きくする"
                  disabled={fontSize >= 150}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                  onKeyDown={(e) => handleKeyboardActivation(e, resetSettings)}
                  aria-label="すべての設定をリセットする"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">コントラスト</h3>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeContrast(false)}
                  onKeyDown={(e) => handleKeyboardActivation(e, () => changeContrast(false))}
                  aria-label="コントラストを下げる"
                  disabled={contrast <= 80}
                >
                  <Contrast className="h-4 w-4" />
                </Button>
                <span className="text-sm" aria-live="polite">{contrast}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeContrast(true)}
                  onKeyDown={(e) => handleKeyboardActivation(e, () => changeContrast(true))}
                  aria-label="コントラストを上げる"
                  disabled={contrast >= 150}
                >
                  <Contrast className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">文字間隔</h3>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeLetterSpacing(false)}
                  onKeyDown={(e) => handleKeyboardActivation(e, () => changeLetterSpacing(false))}
                  aria-label="文字間隔を狭くする"
                  disabled={letterSpacing <= 0}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
                <span className="text-sm" aria-live="polite">{letterSpacing}px</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeLetterSpacing(true)}
                  onKeyDown={(e) => handleKeyboardActivation(e, () => changeLetterSpacing(true))}
                  aria-label="文字間隔を広くする"
                  disabled={letterSpacing >= 5}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">テーマ</h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={toggleTheme}
                onKeyDown={(e) => handleKeyboardActivation(e, toggleTheme)}
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
