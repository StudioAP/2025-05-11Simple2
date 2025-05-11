-- 教室テーブルの作成
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  school_type_id UUID NOT NULL REFERENCES school_types(id),
  area TEXT NOT NULL,
  address TEXT,
  description TEXT,
  contact_email TEXT NOT NULL,
  url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLSポリシーの設定
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- 所有者のみが自分の教室情報を読み書きできるポリシー
CREATE POLICY "所有者のみ教室情報を読み書きできる" ON schools
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 誰でも公開されている教室情報を読むことができるポリシー
CREATE POLICY "誰でも公開されている教室情報を読むことができる" ON schools
  FOR SELECT
  USING (is_published = true);

-- トリガー関数の作成（updated_atを自動更新）
CREATE OR REPLACE FUNCTION update_schools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの設定
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON schools
FOR EACH ROW
EXECUTE FUNCTION update_schools_updated_at();

-- 全文検索用のインデックスとトリガー設定
-- 検索用のベクトルカラムを追加
ALTER TABLE schools ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 検索用インデックスを作成
CREATE INDEX IF NOT EXISTS schools_search_vector_idx ON schools USING gin(search_vector);

-- 検索ベクトルを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION schools_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('japanese', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('japanese', COALESCE(NEW.area, '')), 'B') ||
    setweight(to_tsvector('japanese', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの設定
CREATE TRIGGER schools_search_vector_update
BEFORE INSERT OR UPDATE ON schools
FOR EACH ROW
EXECUTE FUNCTION schools_search_vector_update();

-- 写真テーブルの作成
CREATE TABLE IF NOT EXISTS school_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL,
  photo_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLSポリシーの設定
ALTER TABLE school_photos ENABLE ROW LEVEL SECURITY;

-- 所有者のみが自分の教室の写真を読み書きできるポリシー
CREATE POLICY "所有者のみ教室の写真を読み書きできる" ON school_photos
  USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  );

-- 誰でも公開されている教室の写真を読むことができるポリシー
CREATE POLICY "誰でも公開されている教室の写真を読むことができる" ON school_photos
  FOR SELECT
  USING (
    school_id IN (
      SELECT id FROM schools WHERE is_published = true
    )
  );

-- トリガーの設定
CREATE TRIGGER update_school_photos_updated_at
BEFORE UPDATE ON school_photos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ストレージバケットの作成（教室写真用）
INSERT INTO storage.buckets (id, name, public)
VALUES ('school_photos', 'school_photos', true)
ON CONFLICT (id) DO NOTHING;

-- ストレージポリシーの設定
CREATE POLICY "誰でも公開されている教室写真を読むことができる"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'school_photos'
);

CREATE POLICY "所有者のみ教室写真をアップロードできる"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'school_photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM schools WHERE user_id = auth.uid()
  )
);

CREATE POLICY "所有者のみ教室写真を削除できる"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'school_photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM schools WHERE user_id = auth.uid()
  )
);

-- 教室種別テーブルの作成
CREATE TABLE IF NOT EXISTS school_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLSポリシーの設定
ALTER TABLE school_types ENABLE ROW LEVEL SECURITY;

-- 誰でも教室種別を読むことができるポリシー
CREATE POLICY "誰でも教室種別を読むことができる" ON school_types
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 初期データの挿入
INSERT INTO school_types (name) VALUES
  ('ピアノ教室'),
  ('リトミック教室'),
  ('ピアノ・リトミック教室')
ON CONFLICT (name) DO NOTHING;

-- トリガーの設定
CREATE TRIGGER update_school_types_updated_at
BEFORE UPDATE ON school_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
