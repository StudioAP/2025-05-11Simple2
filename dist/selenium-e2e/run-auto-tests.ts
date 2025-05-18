#!/usr/bin/env node
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { LogAnalyzer } from './utils/log-analyzer';

// ディレクトリパス設定
const BASE_DIR = path.join(__dirname);
const OUTPUT_DIR = path.join(BASE_DIR, 'test-debug-output');
const CONSOLE_LOGS_DIR = path.join(OUTPUT_DIR, 'console-logs');

// 出力ディレクトリの作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(CONSOLE_LOGS_DIR)) {
  fs.mkdirSync(CONSOLE_LOGS_DIR, { recursive: true });
}

/**
 * TypeScriptスクリプトを実行する関数
 */
function runTsScript(scriptPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    console.log(`実行中: ${scriptPath}`);
    
    // ts-nodeで実行
    const process = spawn('npx', ['ts-node', scriptPath], {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ スクリプト実行成功: ${scriptPath}`);
        resolve(code);
      } else {
        console.error(`❌ スクリプト実行エラー: ${scriptPath} (コード: ${code})`);
        // codeはnumberまたはnullですが、nullの場合は1として扱う
        resolve(code ?? 1); 
      }
    });
    
    process.on('error', (err) => {
      console.error(`❌ スクリプト実行中の例外: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Seleniumテストを実行し、結果を分析する自動プロセス
 */
async function runTestsAndAnalyze() {
  try {
    console.log('===== 自動テスト・分析プロセスを開始 =====');
    const startTime = new Date();
    console.log(`開始時刻: ${startTime.toISOString()}`);
    
    // 1. テストの実行
    console.log('\n----- Seleniumテストを実行中 -----');
    await runTsScript(path.join(BASE_DIR, 'school-owner/auto-test-console.ts'));
    
    // 2. ログの分析
    console.log('\n----- コンソールログを分析中 -----');
    const { issues, filePath } = LogAnalyzer.analyzeLatestLogs(CONSOLE_LOGS_DIR);
    
    if (issues.length > 0) {
      // 3. 分析レポートの生成
      console.log(`${issues.length}件の問題が見つかりました`);
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const reportPath = path.join(OUTPUT_DIR, `error-report-${timestamp}.md`);
      const reportFile = LogAnalyzer.generateReport(issues, reportPath);
      
      console.log(`\n----- エラー分析レポート -----`);
      console.log(`検出された問題: ${issues.length}件`);
      
      // 問題タイプ別のカウント
      const typeCounts: Record<string, number> = {};
      issues.forEach(issue => {
        typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
      });
      
      for (const [type, count] of Object.entries(typeCounts)) {
        console.log(`- ${type}: ${count}件`);
      }
      
      if (reportFile) {
        console.log(`\n詳細レポート: ${reportFile}`);
      }
    } else {
      console.log('エラーは検出されませんでした');
    }
    
    // 実行時間の計算
    const endTime = new Date();
    const executionTime = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`\n===== 自動テスト・分析完了 (${executionTime}秒) =====`);
    
  } catch (error) {
    console.error('自動テスト・分析プロセス中にエラーが発生しました:', error);
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  runTestsAndAnalyze()
    .then(() => {
      console.log('自動テスト・分析プロセスが正常に完了しました');
    })
    .catch(error => {
      console.error('自動テスト・分析プロセスでエラーが発生しました:', error);
      process.exit(1);
    });
} 