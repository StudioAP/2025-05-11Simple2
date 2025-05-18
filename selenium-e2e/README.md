# Selenium E2Eテスト

本番環境でのSupabaseの問題を自動的に検出するための自動テスト・分析プロセス

## 必要なパッケージ

このプロジェクトでは以下のパッケージが必要です：

- selenium-webdriver
- @types/selenium-webdriver
- ts-node
- dotenv

すべてのパッケージは既にプロジェクトの`package.json`にインストールされています。

## 型定義について

型定義エラーが表示される場合は、以下のコマンドで型定義パッケージをインストールしてください：

```bash
npm install --save-dev @types/selenium-webdriver @types/dotenv
```

また、`selenium-e2e/types.d.ts`ファイルには必要な型宣言が含まれていますので、型エラーが発生した場合はこのファイルを参照してください。

## テスト実行方法

### 1. 環境変数の設定

`.env.local`ファイルに以下の環境変数を設定してください：

```
TEST_USER_EMAIL=＜テスト用ユーザーのメール＞
TEST_USER_PASSWORD=＜テスト用ユーザーのパスワード＞
NEXT_PUBLIC_SITE_URL=https://piano-rythmique.netlify.app
```

### 2. 自動テスト＆エラー分析の実行

以下のコマンドを実行すると、テスト実行→コンソールログ収集→エラー分析→レポート生成が自動的に行われます。

```bash
npx ts-node selenium-e2e/run-auto-tests.ts
```

### 3. 個別のテスト実行

特定のテストだけを実行したい場合：

```bash
npx ts-node selenium-e2e/school-owner/auto-test-console.ts
```

### 4. ログ分析のみを実行

テスト実行せずに既存のログを分析したい場合：

```bash
npx ts-node selenium-e2e/utils/log-analyzer.ts
```

## 出力ファイル

テスト結果と分析レポートは以下のディレクトリに保存されます：

- `selenium-e2e/test-debug-output/console-logs/`: コンソールログ
- `selenium-e2e/test-debug-output/`: エラー分析レポート（Markdown形式）

## カスタマイズ

- 新しいテストケースを追加する場合は`auto-test-console.ts`の`TEST_SCENARIOS`配列に関数を追加してください
- エラーパターンを追加する場合は`log-analyzer.ts`の`COMMON_ERROR_PATTERNS`配列に定義を追加してください 