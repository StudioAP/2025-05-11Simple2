// 外部モジュールの型宣言
declare module 'selenium-webdriver' {
  export class Builder {
    forBrowser(browser: string): Builder;
    setChromeOptions(options: any): Builder;
    setFirefoxOptions(options: any): Builder;
    build(): Promise<WebDriver>;
  }

  export class WebDriver {
    get(url: string): Promise<void>;
    findElement(locator: By): Promise<WebElement>;
    wait(condition: any, timeout?: number): Promise<any>;
    quit(): Promise<void>;
    manage(): WebDriverManage;
  }

  export class WebElement {
    click(): Promise<void>;
    sendKeys(...args: string[]): Promise<void>;
  }

  export class By {
    static id(id: string): By;
    static css(selector: string): By;
    static xpath(xpath: string): By;
  }

  export class WebDriverManage {
    logs(): WebDriverLogs;
    window(): WebDriverWindow;
  }

  export class WebDriverWindow {
    setRect(rect: { width: number, height: number }): Promise<void>;
  }

  export class WebDriverLogs {
    get(type: string): Promise<LogEntry[]>;
  }

  export function until(condition: any): any;
  export namespace until {
    function urlContains(text: string): any;
    function elementLocated(locator: By): any;
  }

  export namespace logging {
    export enum Level {
      ALL,
      DEBUG,
      INFO,
      WARNING,
      SEVERE,
      OFF
    }
    
    export enum Type {
      BROWSER,
      CLIENT,
      DRIVER,
      PERFORMANCE,
      SERVER
    }
  }
}

declare module 'selenium-webdriver/chrome' {
  export class Options {
    addArguments(...args: string[]): Options;
    setLoggingPrefs(prefs: { [key: string]: string }): Options;
  }
}

declare module 'selenium-webdriver/firefox' {
  export class Options {
    addArguments(...args: string[]): Options;
    setLoggingPrefs(prefs: { [key: string]: string }): Options;
  }
}

declare module 'dotenv' {
  export function config(options?: { path?: string }): void;
}

// Node.js標準モジュール
declare module 'fs' {
  export function writeFileSync(path: string, data: string): void;
  export function readFileSync(path: string, encoding: string): string;
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive: boolean }): void;
  export function appendFileSync(path: string, data: string): void;
  export function readdirSync(path: string): string[];
  export function statSync(path: string): { mtime: Date };
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function basename(path: string): string;
}

declare module 'child_process' {
  export function spawn(command: string, args: string[], options?: any): any;
}

// グローバル変数
declare var __dirname: string;
declare var require: any;
declare var module: any;
declare var process: {
  env: { [key: string]: string };
  exit(code: number): void;
};

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