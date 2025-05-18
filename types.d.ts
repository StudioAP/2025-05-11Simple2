// LogEntryインターフェース
interface LogEntry {
  level: {
    name: string;
    value: number;
  };
  message: string;
  timestamp: number;
}

// LogAnalyzerの戻り値の型定義
interface AnalyzeResult {
  issues: Array<{
    type: string;
    message: string;
    solution: string;
    matches?: string[];
  }>;
  filePath: string | null;
}

// Seleniumの型定義拡張
import { WebDriver, WebElement } from 'selenium-webdriver';

declare module 'selenium-webdriver' {
  // WebDriverインターフェース拡張
  interface WebDriver {
    getCurrentUrl(): Promise<string>;
    sleep(ms: number): Promise<void>;
    findElements(locator: any): Promise<WebElement[]>;
  }

  // Keyオブジェクト
  export namespace Key {
    export const CONTROL: string;
    export const DELETE: string;
    export function chord(...keys: string[]): string;
  }
} 