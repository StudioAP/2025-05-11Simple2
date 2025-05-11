-- 教室問い合わせテーブルの作成
CREATE TABLE IF NOT EXISTS school_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- RLSポリシーの設定
ALTER TABLE school_contacts ENABLE ROW LEVEL SECURITY;

-- 教室運営者は自分の教室への問い合わせのみ閲覧可能
CREATE POLICY "教室運営者は自分の教室への問い合わせのみ閲覧可能" ON school_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schools
      WHERE schools.id = school_contacts.school_id
      AND schools.user_id = auth.uid()
    )
  );

-- 教室運営者は自分の教室への問い合わせのみ作成可能
CREATE POLICY "教室運営者は自分の教室への問い合わせのみ作成可能" ON school_contacts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schools
      WHERE schools.id = school_contacts.school_id
      AND schools.user_id = auth.uid()
    )
  );

-- 匿名ユーザーは問い合わせ作成のみ可能
CREATE POLICY "匿名ユーザーは問い合わせ作成のみ可能" ON school_contacts
  FOR INSERT
  WITH CHECK (auth.role() = 'anon');

-- 問い合わせ件数を集計するためのビュー
CREATE OR REPLACE VIEW school_contact_counts AS
SELECT
  school_id,
  COUNT(*) as contact_count,
  MAX(created_at) as last_contact_at
FROM
  school_contacts
GROUP BY
  school_id;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS school_contacts_school_id_idx ON school_contacts(school_id);
CREATE INDEX IF NOT EXISTS school_contacts_created_at_idx ON school_contacts(created_at);
