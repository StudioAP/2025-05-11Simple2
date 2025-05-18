import * as fs from 'fs';
import * as path from 'path';

/**
 * ブラウザコンソールログの分析ユーティリティ
 * Supabase関連のエラーパターンを検知し、解決策を提案
 */
export class LogAnalyzer {
  /**
   * ログファイルを解析してSupabase関連のエラーを検出
   * @param logsDir ログディレクトリパス
   * @returns 検出された問題と使用したファイルパス
   */
  static async analyzeLatestLogs(logsDir: string): Promise<AnalyzeResult> {
    try {
      console.log(`ログディレクトリを分析中: ${logsDir}`);
      
      // 最新のログファイルを取得
      const files = fs.readdirSync(logsDir)
        .filter(file => file.endsWith('.log') && !file.includes('summary'))
        .map(file => path.join(logsDir, file))
        .sort((a, b) => {
          return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
        });
      
      if (files.length === 0) {
        console.log('分析対象のログが見つかりませんでした');
        return { issues: [], filePath: null };
      }
      
      console.log(`最新のログファイル: ${files[0]}`);
      const latestFile = files[0];
      const logs = fs.readFileSync(latestFile, 'utf8');
      
      // 検出された問題
      const issues: Array<{
        type: string;
        message: string;
        solution: string;
        matches?: string[];
      }> = [];
      
      // 各種エラーパターンの検出
      this.detectAuthErrors(logs, issues);
      this.detectRLSErrors(logs, issues);
      this.detectSchemaErrors(logs, issues);
      this.detectNetworkErrors(logs, issues);
      this.detectSupabaseErrors(logs, issues);
      
      return { issues, filePath: latestFile };
    } catch (error) {
      console.error('ログ分析中にエラーが発生しました:', error);
      return { issues: [], filePath: null };
    }
  }
  
  /**
   * 分析レポートをMarkdown形式で生成
   * @param issues 検出された問題
   * @param outputPath 出力ファイルパス
   * @returns 生成されたファイルパス
   */
  static async generateReport(
    issues: Array<{
      type: string;
      message: string;
      solution: string;
      matches?: string[];
    }>,
    outputPath: string
  ): Promise<string | null> {
    try {
      if (issues.length === 0) {
        console.log('レポートに含める問題がありません');
        return null;
      }
      
      let report = `# Supabase自動テストエラー分析レポート\n\n`;
      report += `生成日時: ${new Date().toISOString()}\n\n`;
      
      // 問題タイプ別にカウント
      const typeCounts: Record<string, number> = {};
      issues.forEach(issue => {
        typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
      });
      
      report += `## 概要\n\n`;
      report += `検出された問題: ${issues.length}件\n\n`;
      
      for (const [type, count] of Object.entries(typeCounts)) {
        report += `- ${type}: ${count}件\n`;
      }
      
      report += `\n## 詳細な問題\n\n`;
      
      // 各問題の詳細
      issues.forEach((issue, index) => {
        report += `### 問題 ${index + 1}: ${issue.type}\n\n`;
        report += `**エラーメッセージ:** ${issue.message}\n\n`;
        report += `**推奨される対応:** ${issue.solution}\n\n`;
        
        if (issue.matches && issue.matches.length > 0) {
          report += `**関連するログ:**\n\`\`\`\n${issue.matches.join('\n')}\n\`\`\`\n\n`;
        }
      });
      
      // レポートをファイルに保存
      fs.writeFileSync(outputPath, report, 'utf8');
      console.log(`分析レポートを保存しました: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error('レポート生成中にエラーが発生しました:', error);
      return null;
    }
  }
  
  /**
   * 認証関連のエラーを検出
   */
  private static detectAuthErrors(logs: string, issues: any[]): void {
    // Email not confirmed エラー
    if (logs.includes('Email not confirmed') || logs.includes('email_confirmation_required')) {
      issues.push({
        type: '認証エラー',
        message: 'メールアドレスが確認されていません',
        solution: 'Supabase管理画面でユーザーのEmail confirmationステータスを確認済みに更新してください。',
        matches: this.extractMatches(logs, /(Email not confirmed|email_confirmation_required)/g)
      });
    }
    
    // 認証トークン無効
    if (logs.includes('JWT') && logs.includes('invalid')) {
      issues.push({
        type: '認証エラー',
        message: 'JWTトークンが無効または期限切れです',
        solution: 'サインアウトしてから再度サインインするか、JWTの有効期限設定を確認してください。',
        matches: this.extractMatches(logs, /.*JWT.*invalid.*/g)
      });
    }
    
    // 401認証エラー
    if (logs.includes('401') && (logs.includes('Unauthorized') || logs.includes('認証'))) {
      issues.push({
        type: '認証エラー',
        message: '認証エラー (401 Unauthorized)',
        solution: '1. ユーザーが正しくサインインしていることを確認\n2. Supabase APIキーが有効か確認\n3. RLSポリシーが正しく設定されているか確認',
        matches: this.extractMatches(logs, /.*(401|Unauthorized).*/g)
      });
    }
  }
  
  /**
   * RLS関連のエラーを検出
   */
  private static detectRLSErrors(logs: string, issues: any[]): void {
    // ストレージRLSエラー
    if ((logs.includes('storage') || logs.includes('バケット')) && 
        (logs.includes('permission') || logs.includes('access') || logs.includes('denied'))) {
      issues.push({
        type: 'ストレージRLSエラー',
        message: 'ストレージバケットへのアクセス権限がありません',
        solution: '1. バケットのRLSポリシーを確認\n2. ユーザーロールとパスパターンが一致するか検証\n3. スクール所有者IDとフォルダパスの関連付けを確認',
        matches: this.extractMatches(logs, /.*(storage|バケット).*?(permission|access|denied).*/g)
      });
    }
    
    // データベースRLSエラー
    if (logs.includes('policy') || logs.includes('permission denied')) {
      issues.push({
        type: 'データベースRLSエラー',
        message: 'データベーステーブルへのアクセス権限がありません',
        solution: '1. テーブルのRLSポリシーを確認\n2. クエリが正しいか確認\n3. ユーザーが適切なロールを持っているか確認',
        matches: this.extractMatches(logs, /.*(policy|permission denied).*/g)
      });
    }
  }
  
  /**
   * スキーマ関連のエラーを検出
   */
  private static detectSchemaErrors(logs: string, issues: any[]): void {
    // カラム不足エラー
    if (logs.includes('column') && (logs.includes('does not exist') || logs.includes('not found'))) {
      const columnMatch = logs.match(/column\s+['"]?([a-zA-Z0-9_]+)['"]?\s+does not exist/);
      const columnName = columnMatch ? columnMatch[1] : '不明';
      
      issues.push({
        type: 'スキーマエラー',
        message: `カラム '${columnName}' が存在しません`,
        solution: `該当のテーブルに '${columnName}' カラムを追加してください。`,
        matches: this.extractMatches(logs, /.*column.*does not exist.*/g)
      });
    }
    
    // テーブル不足エラー
    if (logs.includes('relation') && logs.includes('does not exist')) {
      const tableMatch = logs.match(/relation\s+['"]?([a-zA-Z0-9_]+)['"]?\s+does not exist/);
      const tableName = tableMatch ? tableMatch[1] : '不明';
      
      issues.push({
        type: 'スキーマエラー',
        message: `テーブル '${tableName}' が存在しません`,
        solution: `データベースに '${tableName}' テーブルを作成してください。`,
        matches: this.extractMatches(logs, /.*relation.*does not exist.*/g)
      });
    }
  }
  
  /**
   * ネットワーク関連のエラーを検出
   */
  private static detectNetworkErrors(logs: string, issues: any[]): void {
    // CORS エラー
    if (logs.includes('CORS') || logs.includes('Cross-Origin')) {
      issues.push({
        type: 'ネットワークエラー',
        message: 'CORSポリシー違反',
        solution: '1. Supabase管理画面でCORS設定を確認\n2. 許可されたオリジンにデプロイURLを追加\n3. supabase.jsのクライアント初期化にURLが正しく設定されているか確認',
        matches: this.extractMatches(logs, /.*(CORS|Cross-Origin).*/g)
      });
    }
    
    // レート制限エラー
    if (logs.includes('rate limit') || logs.includes('too many requests') || 
        logs.includes('429') || logs.includes('Rate limit exceeded')) {
      issues.push({
        type: 'レート制限エラー',
        message: 'APIレート制限に達しました',
        solution: '1. リクエスト数を減らす\n2. バッチ処理を導入\n3. プランのアップグレードを検討',
        matches: this.extractMatches(logs, /.*(rate limit|too many requests|429|Rate limit exceeded).*/g)
      });
    }
    
    // 接続エラー
    if (logs.includes('connection') && (logs.includes('refused') || logs.includes('reset') || logs.includes('timeout'))) {
      issues.push({
        type: 'ネットワークエラー',
        message: 'Supabase APIへの接続エラー',
        solution: '1. インターネット接続を確認\n2. Supabaseサービスのステータスを確認\n3. VPNやファイアウォール設定を確認',
        matches: this.extractMatches(logs, /.*connection.*(refused|reset|timeout).*/g)
      });
    }
    
    // リソース読み込みエラー
    if (logs.includes('Failed to load resource')) {
      issues.push({
        type: 'リソース読み込みエラー',
        message: 'リソースの読み込みに失敗しました',
        solution: '1. ネットワーク接続を確認\n2. URLが正しいか確認\n3. リソースが存在するか確認',
        matches: this.extractMatches(logs, /Failed to load resource.*/g)
      });
    }
  }
  
  /**
   * Supabase関連のエラーを検出
   */
  private static detectSupabaseErrors(logs: string, issues: any[]): void {
    // Supabase API接続エラー
    if (logs.includes('supabase') && logs.includes('Failed to fetch')) {
      issues.push({
        type: 'Supabase接続エラー',
        message: 'Supabase APIへの接続に失敗しました',
        solution: '1. Supabaseプロジェクトが正常に動作しているか確認\n2. APIキーが正しいか確認\n3. URLが正しいか確認\n4. CORSの設定を確認',
        matches: this.extractMatches(logs, /.*supabase.*Failed to fetch.*/gi)
      });
    }
    
    // JWT関連のエラー
    if (logs.includes('JWT') || logs.includes('token')) {
      issues.push({
        type: 'JWT認証エラー',
        message: 'JWTトークンの認証に問題があります',
        solution: '1. トークンの有効期限を確認\n2. Supabaseのsignin処理を確認\n3. 環境変数のJWTシークレットが正しいか確認',
        matches: this.extractMatches(logs, /.*(JWT|token).*(invalid|expired|malformed).*/gi)
      });
    }
    
    // ストレージ関連のエラー
    if (logs.includes('storage') && (logs.includes('error') || logs.includes('failed'))) {
      issues.push({
        type: 'ストレージエラー',
        message: 'Supabaseストレージの操作に失敗しました',
        solution: '1. バケットが存在するか確認\n2. RLSポリシーを確認\n3. ファイルサイズと形式を確認',
        matches: this.extractMatches(logs, /.*storage.*(error|failed).*/gi)
      });
    }
    
    // DB関連のエラー
    if (logs.includes('database') || logs.includes('query') || logs.includes('table')) {
      issues.push({
        type: 'データベースエラー',
        message: 'データベースクエリの実行に失敗しました',
        solution: '1. テーブル構造を確認\n2. RLSポリシーを確認\n3. クエリ構文を確認\n4. トランザクション設定を確認',
        matches: this.extractMatches(logs, /.*(database|query|table).*(error|failed).*/gi)
      });
    }
    
    // 認証関連エラー
    if (logs.includes('auth') || logs.includes('login') || logs.includes('sign')) {
      issues.push({
        type: '認証エラー',
        message: 'ユーザー認証処理でエラーが発生しました',
        solution: '1. ユーザー情報の確認\n2. 認証方法の確認\n3. redirectURLの設定確認\n4. Email確認設定の確認',
        matches: this.extractMatches(logs, /.*(auth|login|sign).*(error|failed).*/gi)
      });
    }
  }
  
  /**
   * 正規表現にマッチするログ行を抽出
   */
  private static extractMatches(text: string, pattern: RegExp): string[] {
    const matches: string[] = [];
    let match;
    
    // テキストを行に分割
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (pattern.test(line)) {
        matches.push(line.trim());
      }
    }
    
    return matches;
  }
} 