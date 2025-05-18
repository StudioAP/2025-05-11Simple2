import * as fs from 'fs';
import * as path from 'path';

/**
 * エラー種別の定義
 */
interface ErrorPattern {
  name: string;
  regex: RegExp;
  solution: string;
}

/**
 * 分析結果の型定義
 */
interface IssueItem {
  type: string;
  message: string;
  solution: string;
  matches?: string[];
}

/**
 * よくあるエラーパターンとその解決策
 */
const COMMON_ERROR_PATTERNS: ErrorPattern[] = [
  {
    name: 'RLS Policy違反',
    regex: /new row violates row-level security policy/i,
    solution: 'ストレージバケットのRLSポリシーを確認してください。特に、パスにユーザーIDやスクールIDを含める場合はポリシーを適切に設定する必要があります。'
  },
  {
    name: 'Email未確認エラー',
    regex: /Email not confirmed/i,
    solution: 'ユーザーのメールアドレスが確認されていません。開発環境ではSupabaseの「Email auto-confirm」設定を有効にするか、特定のユーザーを手動で確認済みに設定してください。'
  },
  {
    name: 'レート制限エラー',
    regex: /For security purposes, you can only request this after \d+ seconds/i,
    solution: '短時間に多数のリクエストが送信されました。Supabaseのレート制限を一時的に緩和するか、リクエスト間の遅延を追加してください。'
  },
  {
    name: 'カラム不在エラー',
    regex: /Could not find the '(.+?)' column of '(.+?)'/i,
    solution: 'スキーマの同期が必要です。該当のテーブルにカラムが存在しない可能性があります。マイグレーションを適用してください。'
  },
  {
    name: '認証エラー',
    regex: /401|Unauthorized/i,
    solution: 'ユーザー認証に問題があります。JWT トークンが有効か、認証セッションが正しく機能しているかを確認してください。'
  },
  {
    name: 'リクエスト形式エラー',
    regex: /406|Not Acceptable/i,
    solution: 'APIリクエストの形式に問題があります。ヘッダーや受け入れ可能な形式、RLSポリシー設定を確認してください。'
  }
];

/**
 * コンソールログを分析してエラーを特定し解決策を提案するクラス
 */
export class LogAnalyzer {
  /**
   * 指定されたログファイルを分析
   */
  static analyzeLogFile(logFilePath: string): {issues: IssueItem[], rawContent: string} {
    try {
      if (!fs.existsSync(logFilePath)) {
        throw new Error(`ログファイルが見つかりません: ${logFilePath}`);
      }

      const content = fs.readFileSync(logFilePath, 'utf8');
      return this.analyzeLogContent(content);
    } catch (error) {
      console.error('ログ分析中にエラーが発生しました:', error);
      return { issues: [], rawContent: '' };
    }
  }

  /**
   * ログ内容を分析してエラーパターンをマッチング
   */
  static analyzeLogContent(content: string): {issues: IssueItem[], rawContent: string} {
    const issues: IssueItem[] = [];
    const lines = content.split('\n');

    // エラーメッセージの検出
    for (const line of lines) {
      // エラー行（行内にエラーを示すキーワードを含む）の抽出
      if (line.toLowerCase().includes('error') || 
          line.toLowerCase().includes('failed') || 
          line.includes('400') || 
          line.includes('401') || 
          line.includes('403') || 
          line.includes('404') || 
          line.includes('406') || 
          line.includes('429') || 
          line.includes('500')) {
        
        // 既知のエラーパターンとマッチング
        const matchedPatterns = COMMON_ERROR_PATTERNS.filter(pattern => 
          pattern.regex.test(line)
        );

        if (matchedPatterns.length > 0) {
          for (const pattern of matchedPatterns) {
            const match = line.match(pattern.regex);
            
            issues.push({
              type: pattern.name,
              message: line,
              solution: pattern.solution,
              matches: match ? match.slice(1) : []
            });
          }
        } else {
          // 未知のエラー
          issues.push({
            type: 'その他のエラー',
            message: line,
            solution: 'このエラーは自動分析できません。詳細なコンテキストが必要です。'
          });
        }
      }
    }

    return { issues, rawContent: content };
  }

  /**
   * ログディレクトリ内の最新のエラーログを分析
   */
  static analyzeLatestLogs(logsDir: string): {issues: IssueItem[], filePath: string | null} {
    try {
      // ディレクトリの存在確認
      if (!fs.existsSync(logsDir)) {
        throw new Error(`ログディレクトリが見つかりません: ${logsDir}`);
      }

      // ログファイル一覧の取得
      const files = fs.readdirSync(logsDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(logsDir, file),
          time: fs.statSync(path.join(logsDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // 最新順にソート

      if (files.length === 0) {
        return { issues: [], filePath: null };
      }

      // 最新のログファイルを分析
      const latestLog = files[0];
      const { issues } = this.analyzeLogFile(latestLog.path);
      
      return { issues, filePath: latestLog.path };
    } catch (error) {
      console.error('最新ログの分析中にエラーが発生しました:', error);
      return { issues: [], filePath: null };
    }
  }

  /**
   * 分析結果をレポートとして保存
   */
  static generateReport(issues: IssueItem[], outputPath: string): string | null {
    try {
      const timestamp = new Date().toISOString();
      let report = `# エラー分析レポート (${timestamp})\n\n`;

      if (issues.length === 0) {
        report += '分析対象のエラーは見つかりませんでした。\n';
      } else {
        report += `## 検出された問題 (${issues.length}件)\n\n`;
        
        issues.forEach((issue, index) => {
          report += `### ${index + 1}. ${issue.type}\n`;
          report += `- **メッセージ**: \`${issue.message}\`\n`;
          report += `- **解決策**: ${issue.solution}\n`;
          if (issue.matches && issue.matches.length > 0) {
            report += `- **詳細**: ${issue.matches.join(', ')}\n`;
          }
          report += '\n';
        });

        // グループ化された問題の概要
        const typeCounts: Record<string, number> = {};
        issues.forEach(issue => {
          typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
        });
        
        report += '## 問題の種類と頻度\n\n';
        for (const [type, count] of Object.entries(typeCounts)) {
          report += `- ${type}: ${count}件\n`;
        }
      }

      // 解決方法の提案
      report += '\n## 推奨される対応\n\n';
      const uniqueSolutions = [...new Set(issues.map(issue => issue.solution))];
      uniqueSolutions.forEach((solution, index) => {
        report += `${index + 1}. ${solution}\n`;
      });

      // レポートの保存
      fs.writeFileSync(outputPath, report);
      console.log(`レポートを保存しました: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error('レポート生成中にエラーが発生しました:', error);
      return null;
    }
  }
}

// コマンドラインから実行された場合
if (require.main === module) {
  const logsDir = path.join(__dirname, '..', 'test-debug-output', 'console-logs');
  const { issues, filePath } = LogAnalyzer.analyzeLatestLogs(logsDir);
  
  if (issues.length > 0) {
    const reportPath = path.join(__dirname, '..', 'test-debug-output', 
      `error-report-${new Date().toISOString().replace(/:/g, '-')}.md`);
    
    LogAnalyzer.generateReport(issues, reportPath);
    console.log(`分析完了: ${issues.length}件の問題が見つかりました。レポート: ${reportPath}`);
  } else {
    console.log('分析完了: エラーは見つかりませんでした。');
  }
} 