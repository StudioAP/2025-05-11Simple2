-- RLSポリシーの改善と強化

-- サービスロール確認関数の作成（既存の関数がない場合）
CREATE OR REPLACE FUNCTION auth.is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
EXCEPTION
  WHEN OTHERS THEN RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者確認関数の作成
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT is_admin FROM auth.users WHERE id = auth.uid());
EXCEPTION
  WHEN OTHERS THEN RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- サブスクリプションテーブルのポリシー改善
DROP POLICY IF EXISTS "管理者のみサブスクリプションを更新可能" ON subscriptions;
CREATE POLICY "管理者またはサービスロールのみサブスクリプションを更新可能" ON subscriptions
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.is_service_role() OR
    auth.is_admin()
  );

DROP POLICY IF EXISTS "管理者のみサブスクリプションを更新可能" ON subscriptions;
CREATE POLICY "管理者またはサービスロールのみサブスクリプションを挿入可能" ON subscriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    auth.is_service_role() OR
    auth.is_admin()
  );

-- 問い合わせテーブルのポリシー改善
DROP POLICY IF EXISTS "匿名ユーザーは問い合わせ作成のみ可能" ON school_contacts;
CREATE POLICY "匿名ユーザーまたは認証済みユーザーは問い合わせ作成可能" ON school_contacts
  FOR INSERT
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated')
  );

-- 閲覧数テーブルのポリシー改善
DROP POLICY IF EXISTS "匿名ユーザーは閲覧データの作成のみ可能" ON school_views;
CREATE POLICY "匿名ユーザーまたは認証済みユーザーは閲覧データの作成可能" ON school_views
  FOR INSERT
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated')
  );

-- ストレージポリシーの改善
-- 教室写真ストレージポリシー
DROP POLICY IF EXISTS "所有者のみ教室写真をアップロードできる" ON storage.objects;
CREATE POLICY "所有者のみ教室写真をアップロードできる"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'school_photos' AND
  (
    -- 教室IDをパスから抽出して所有者チェック
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM schools WHERE user_id = auth.uid()
    ) OR
    -- サービスロールまたは管理者は全てアップロード可能
    auth.is_service_role() OR
    auth.is_admin()
  )
);

DROP POLICY IF EXISTS "所有者のみ教室写真を削除できる" ON storage.objects;
CREATE POLICY "所有者のみ教室写真を削除できる"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'school_photos' AND
  (
    -- 教室IDをパスから抽出して所有者チェック
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM schools WHERE user_id = auth.uid()
    ) OR
    -- サービスロールまたは管理者は全て削除可能
    auth.is_service_role() OR
    auth.is_admin()
  )
);

-- お知らせ写真ストレージポリシー
DROP POLICY IF EXISTS "所有者のみお知らせ写真をアップロードできる" ON storage.objects;
CREATE POLICY "所有者のみお知らせ写真をアップロードできる"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'announcement_photos' AND
  (
    -- 教室IDをパスから抽出して所有者チェック
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM schools WHERE user_id = auth.uid()
    ) OR
    -- サービスロールまたは管理者は全てアップロード可能
    auth.is_service_role() OR
    auth.is_admin()
  )
);

DROP POLICY IF EXISTS "所有者のみお知らせ写真を削除できる" ON storage.objects;
CREATE POLICY "所有者のみお知らせ写真を削除できる"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'announcement_photos' AND
  (
    -- 教室IDをパスから抽出して所有者チェック
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM schools WHERE user_id = auth.uid()
    ) OR
    -- サービスロールまたは管理者は全て削除可能
    auth.is_service_role() OR
    auth.is_admin()
  )
);

-- 教室テーブルのRLSポリシー改善
DROP POLICY IF EXISTS "所有者のみ教室情報を読み書きできる" ON schools;
CREATE POLICY "所有者のみ教室情報を読み書きできる" ON schools
  FOR ALL
  USING (
    user_id = auth.uid() OR
    auth.is_service_role() OR
    auth.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid() OR
    auth.is_service_role() OR
    auth.is_admin()
  );

-- ユーザー管理用のRLSポリシー
-- 管理者のみが全ユーザー情報を閲覧可能
CREATE POLICY "管理者のみ全ユーザー情報を閲覧可能" ON auth.users
  FOR SELECT
  USING (
    auth.is_admin() OR
    auth.is_service_role() OR
    auth.uid() = id
  );

-- サブスクリプション状態確認用の関数
CREATE OR REPLACE FUNCTION public.is_subscription_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > now())
  ) INTO is_active;
  
  RETURN is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
