# Selenium自動テストシステム

このプロジェクトは、piano-rythmique（ピアノリトミック）アプリケーション用の自動テスト・分析システムです。Selenium WebDriverを使用してユーザーインターフェースを自動的にテストし、特にSupabase関連の問題を検出・分析します。

## 主な機能

1. **自動UI操作テスト**
   - ログイン
   - プロフィール閲覧
   - 教室情報登録
   - 写真アップロード
   - お知らせ投稿

2. **エラー自動検出・分析**
   - RLSポリシー違反
   - 認証エラー
   - スキーマエラー
   - ネットワークエラー
   - レート制限エラー

3. **問題診断レポート生成**
   - 検出された問題の分類
   - 解決策の提案
   - エラーログの保存と分析

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# TypeScriptの型定義をインストール
npm install -D @types/node @types/selenium-webdriver
```

## 使用方法

```bash
# すべてのテストを実行し、結果を分析
npm run test

# 教室オーナー向けテストのみ実行
npm run test:school

# 既存のログファイルを分析
npm run analyze
```

## 環境変数

テスト実行には以下の環境変数が必要です：

- `NEXT_PUBLIC_SITE_URL` - テスト対象サイトのURL（デフォルト: https://piano-rythmique.netlify.app）
- `TEST_USER_EMAIL` - テストユーザーのメールアドレス
- `TEST_USER_PASSWORD` - テストユーザーのパスワード

これらは `.env.local` ファイルに設定することができます。

## ディレクトリ構造

- `school-owner/` - 教室オーナー向けテスト
- `utils/` - ユーティリティ関数（ドライバー設定、ログ分析など）
- `test-debug-output/` - テスト実行結果とログファイル

## トラブルシューティング

よくある問題と解決方法：

1. **要素が見つからないエラー**
   - UIセレクタが変更された可能性があります。auto-test-console.tsファイルのセレクタを更新してください。

2. **認証エラー**
   - テストユーザーの認証情報を確認してください。
   - Supabaseの認証設定（メール確認など）を確認してください。

3. **RLSポリシーエラー**
   - Supabaseのデータベース/ストレージのRLSポリシーを確認してください。

## メンテナンス

1. セレクタの更新：WebサイトのUIが変更された場合は、school-owner/auto-test-console.tsファイル内のセレクタを更新してください。

2. エラーパターンの追加：新しいエラーパターンを検出したい場合は、utils/log-analyzer.tsファイルのCOMMON_ERROR_PATTERNSに追加してください。

3. テストシナリオの追加：TEST_SCENARIOSに新しいテスト関数を追加することで、テスト範囲を拡張できます。 