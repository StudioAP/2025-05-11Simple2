# Seleniumテスト・分析レポート

## 実施日時
2025-05-18

## テスト対象
- サイト: piano-rythmique.netlify.app
- Supabaseプロジェクト: piano-ritomikku-search (jqhqtupgorbmfkzcxrwn)

## 検出された問題

### 1. Next.js RSCペイロード取得エラー
```
Failed to fetch RSC payload for https://piano-rythmique.netlify.app/. Falling back to browser navigation.
```

**原因**：
- Supabaseへの接続が失敗している
- CORS設定またはRLSポリシーの問題の可能性が高い

**実施した修正**：
1. ストレージバケット「school-photos」の作成と設定の最適化
2. RLSポリシーの修正（schools、school_photos、school_announcements）
3. pg_net拡張機能の有効化

### 2. UIセレクタの不一致
テストは要素が見つからないエラーで失敗しています。これは実際のWebサイトのDOM構造とテストで使用しているセレクタが一致していないためです。

**必要な対応**：
1. 実際のサイトを確認して正確なセレクタに更新する
2. より堅牢なセレクタ戦略の実装（複数の検索方法）

## 今後の推奨事項

### 短期的対策
1. **UIセレクタの更新**：
   - 実際のサイトのDOM構造に合わせてセレクタを更新
   - ページごとにテスト用のdata-testid属性の追加を検討

2. **CORS設定の確認**：
   - Netlifyドメインが Supabaseの許可リストに含まれていることを確認
   - 必要に応じてNext.jsのAPI Routes設定を見直し

### 中長期的対策
1. **E2Eテスト強化**：
   - より堅牢なテスト方法（Cypress、Playwright）への移行も検討
   - テスト用のモック環境の構築

2. **RLS設計の見直し**：
   - より厳格なポリシー設定によるセキュリティ向上
   - バケットアクセスポリシーの最適化

## まとめ
自動テストシステムは正常に動作していますが、UIセレクタやSupabase接続の問題が見られます。特にRSCペイロード取得エラーはNext.jsアプリケーションとSupabase間の接続に問題があることを示しています。RLSポリシーとCORS設定の修正により、一部の問題は解決できると思われますが、本番環境での詳細なデバッグも必要です。 