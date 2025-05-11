-- お知らせテーブルの作成
CREATE TABLE IF NOT EXISTS school_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  photo_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLSポリシーの設定
ALTER TABLE school_announcements ENABLE ROW LEVEL SECURITY;

-- 所有者のみが自分の教室のお知らせを読み書きできるポリシー
CREATE POLICY "所有者のみ教室のお知らせを読み書きできる" ON school_announcements
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

-- 誰でも公開されているお知らせを読むことができるポリシー
CREATE POLICY "誰でも公開されているお知らせを読むことができる" ON school_announcements
  FOR SELECT
  USING (
    school_id IN (
      SELECT id FROM schools WHERE is_published = true
    )
  );

-- トリガー関数の作成（updated_atを自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの設定
CREATE TRIGGER update_school_announcements_updated_at
BEFORE UPDATE ON school_announcements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ストレージバケットの作成（お知らせ写真用）
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement_photos', 'announcement_photos', true)
ON CONFLICT (id) DO NOTHING;

-- ストレージポリシーの設定
CREATE POLICY "誰でも公開されているお知らせ写真を読むことができる"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'announcement_photos'
);

CREATE POLICY "所有者のみお知らせ写真をアップロードできる"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'announcement_photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM schools WHERE user_id = auth.uid()
  )
);

CREATE POLICY "所有者のみお知らせ写真を削除できる"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'announcement_photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM schools WHERE user_id = auth.uid()
  )
);
