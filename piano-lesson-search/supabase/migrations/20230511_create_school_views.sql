-- 教室閲覧数テーブルの作成
CREATE TABLE IF NOT EXISTS school_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLSポリシーの設定
ALTER TABLE school_views ENABLE ROW LEVEL SECURITY;

-- 教室運営者は自分の教室の閲覧データのみ閲覧可能
CREATE POLICY "教室運営者は自分の教室の閲覧データのみ閲覧可能" ON school_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schools
      WHERE schools.id = school_views.school_id
      AND schools.user_id = auth.uid()
    )
  );

-- 匿名ユーザーは閲覧データの作成のみ可能
CREATE POLICY "匿名ユーザーは閲覧データの作成のみ可能" ON school_views
  FOR INSERT
  WITH CHECK (auth.role() = 'anon');

-- 閲覧数を集計するためのビュー
CREATE OR REPLACE VIEW school_view_counts AS
SELECT
  school_id,
  COUNT(*) as view_count,
  COUNT(DISTINCT ip_address) as unique_view_count,
  MAX(viewed_at) as last_viewed_at
FROM
  school_views
GROUP BY
  school_id;

-- 日別閲覧数を集計するためのビュー
CREATE OR REPLACE VIEW school_daily_views AS
SELECT
  school_id,
  DATE_TRUNC('day', viewed_at) as view_date,
  COUNT(*) as view_count,
  COUNT(DISTINCT ip_address) as unique_view_count
FROM
  school_views
GROUP BY
  school_id, DATE_TRUNC('day', viewed_at)
ORDER BY
  school_id, DATE_TRUNC('day', viewed_at) DESC;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS school_views_school_id_idx ON school_views(school_id);
CREATE INDEX IF NOT EXISTS school_views_viewed_at_idx ON school_views(viewed_at);
