import { WebDriver, logging } from 'selenium-webdriver';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Seleniumテスト中にブラウザコンソールログをキャプチャするユーティリティ
 */
export class ConsoleLogger {
  private driver: WebDriver;
  private testName: string;
  private outputDir: string;

  constructor(driver: WebDriver, testName: string) {
    this.driver = driver;
    this.testName = testName;
    this.outputDir = path.join(__dirname, '..', 'test-debug-output', 'console-logs');
    
    // 出力ディレクトリの作成
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * ブラウザのコンソールログを取得して保存
   */
  async captureConsoleLogs() {
    try {
      // ブラウザログの取得
      const logs = await this.driver.manage().logs().get('browser');
      
      // タイムスタンプの生成
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFileName = `${this.testName}_${timestamp}.log`;
      const logFilePath = path.join(this.outputDir, logFileName);
      
      // ログの整形
      const formattedLogs = logs.map(log => {
        return `[${log.level.name}] [${new Date(log.timestamp).toISOString()}] ${log.message}`;
      }).join('\n');
      
      // ファイルに保存
      fs.writeFileSync(logFilePath, formattedLogs);
      
      console.log(`コンソールログを保存しました: ${logFilePath}`);
      return { logs, filePath: logFilePath };
    } catch (error) {
      console.error('コンソールログの取得に失敗しました:', error);
      return { logs: [], filePath: null, error };
    }
  }

  /**
   * エラーログのみを抽出
   */
  async captureErrorLogs() {
    try {
      const { logs } = await this.captureConsoleLogs();
      
      // エラーログのみをフィルタリング
      const warningLevel = logging.Level.WARNING.toString();
      const errorLogs = logs.filter(log => 
        log.level.name === 'WARNING' || log.level.name === 'SEVERE'
      );
      
      // タイムスタンプの生成
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFileName = `${this.testName}_errors_${timestamp}.log`;
      const logFilePath = path.join(this.outputDir, logFileName);
      
      // ログの整形
      const formattedLogs = errorLogs.map(log => {
        return `[${log.level.name}] [${new Date(log.timestamp).toISOString()}] ${log.message}`;
      }).join('\n');
      
      // ファイルに保存
      fs.writeFileSync(logFilePath, formattedLogs);
      
      console.log(`エラーログを保存しました: ${logFilePath}`);
      return { errorLogs, filePath: logFilePath };
    } catch (error) {
      console.error('エラーログの取得に失敗しました:', error);
      return { errorLogs: [], filePath: null, error };
    }
  }
} 