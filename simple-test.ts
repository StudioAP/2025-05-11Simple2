/**
 * 単純なテストスクリプト - 基本的な設定と依存関係の確認用
 */

import * as fs from 'fs';
import * as path from 'path';

// 基本的なファイル操作のテスト
const testFilePath = path.join(__dirname, 'test-output.txt');

try {
  // 現在の日時を取得
  const now = new Date().toISOString();
  
  // ファイルに書き込み
  fs.writeFileSync(testFilePath, `テスト実行時刻: ${now}\n`);
  fs.appendFileSync(testFilePath, `Node.jsバージョン: ${process.version}\n`);
  fs.appendFileSync(testFilePath, `実行ディレクトリ: ${__dirname}\n`);
  
  console.log('✅ 基本テスト成功 - ファイル書き込みを実行しました');
  console.log(`ファイルパス: ${testFilePath}`);
} catch (error) {
  console.error('❌ テスト失敗:', error);
} 