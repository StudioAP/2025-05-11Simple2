-- 完全なRLSポリシー設定
-- 作成日: 2023-05-14
-- 目的: データベースセキュリティの強化とRLSポリシーの完全化

-- 1. サービスロールと管理者の判定関数を改善
DROP FUNCTION IF EXISTS auth.is_service_role();
CREATE OR REPLACE FUNCTION auth.is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- サービスロールかどうかをJWTから判定
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
EXCEPTION
  WHEN OTHERS THEN RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS auth.is_admin();
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- 管理者フラグをユーザーテーブルから取得
  RETURN (SELECT is_admin FROM auth.users WHERE id = auth.uid());
EXCEPTION
  WHEN OTHERS THEN RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. サブスクリプション管理のためのポリシー整理
-- 重複するポリシーを削除
DROP POLICY IF EXISTS "管理者のみサブスクリプションを更新可能" ON subscriptions;
DROP POLICY IF EXISTS "管理者またはサービスロールのみサブスクリプションを更新可能" ON subscriptions;
DROP POLICY IF EXISTS "管理者またはサービスロールのみサブスクリプションを挿入可能" ON subscriptions;

-- 統合されたポリシーを作成
CREATE POLICY "ユーザー・管理者・サービスロールのみサブスクリプションを更新可能" ON subscriptions
  FOR ALL
  USING (
    auth.uid() = user_id OR
    auth.is_service_role() OR
    auth.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id OR
    auth.is_service_role() OR
    auth.is_admin()
  );

-- 3. 問い合わせテーブルのポリシー改善
DROP POLICY IF EXISTS "匿名ユーザーは問い合わせ作成のみ可能" ON school_contacts;
DROP POLICY IF EXISTS "匿名ユーザーまたは認証済みユーザーは問い合わせ作成可能" ON school_contacts;

CREATE POLICY "誰でも問い合わせの作成が可能" ON school_contacts
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- 4. ストレージポリシーの改善
-- 教室写真とお知らせ写真に関するポリシーを統合して改善

-- 教室写真のポリシー整理
DROP POLICY IF EXISTS "所有者のみ教室写真をアップロードできる" ON storage.objects;
DROP POLICY IF EXISTS "所有者のみ教室写真を削除できる" ON storage.objects;

-- 統合版の読み取りポリシー（バケットごとに個別に設定）
CREATE POLICY "誰でも公開されている写真を読むことができる"
ON storage.objects FOR SELECT
USING (
  (bucket_id = 'school_photos' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM schools WHERE is_published = true
    )
  ) OR
  (bucket_id = 'announcement_photos' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM schools WHERE is_published = true
    )
  )
);

-- 統合版の書き込みポリシー
CREATE POLICY "所有者のみ写真をアップロードできる"
ON storage.objects FOR INSERT
WITH CHECK (
  (bucket_id IN ('school_photos', 'announcement_photos') AND
   (
     -- 教室IDをパスから抽出して所有者チェック
     (storage.foldername(name))[1] IN (
       SELECT id::text FROM schools WHERE user_id = auth.uid()
     ) OR
     -- サービスロールまたは管理者は全てアップロード可能
     auth.is_service_role() OR
     auth.is_admin()
   )
  )
);

-- 統合版の削除ポリシー
CREATE POLICY "所有者のみ写真を削除できる"
ON storage.objects FOR DELETE
USING (
  (bucket_id IN ('school_photos', 'announcement_photos') AND
   (
     -- 教室IDをパスから抽出して所有者チェック
     (storage.foldername(name))[1] IN (
       SELECT id::text FROM schools WHERE user_id = auth.uid()
     ) OR
     -- サービスロールまたは管理者は全て削除可能
     auth.is_service_role() OR
     auth.is_admin()
   )
  )
);

-- 5. 教室テーブルのRLSポリシー整理
-- 既存ポリシーの改善（サービスロールと管理者のアクセス権を追加）
DROP POLICY IF EXISTS "所有者のみ教室情報を読み書きできる" ON schools;

-- 教室情報の読み書きポリシー
CREATE POLICY "所有者・管理者・サービスロールのみ教室情報を読み書きできる" ON schools
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

-- 6. お知らせテーブルのRLSポリシー整理
DROP POLICY IF EXISTS "所有者のみ教室のお知らせを読み書きできる" ON school_announcements;

CREATE POLICY "所有者・管理者・サービスロールのみ教室のお知らせを読み書きできる" ON school_announcements
  FOR ALL
  USING (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    ) OR
    auth.is_service_role() OR
    auth.is_admin()
  )
  WITH CHECK (
    school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    ) OR
    auth.is_service_role() OR
    auth.is_admin()
  );

-- 7. サブスクリプション状態確認用の関数を改善
DROP FUNCTION IF EXISTS public.is_subscription_active(UUID);
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
  
  -- 管理者とサービスロールは常にアクティブとみなす
  IF NOT is_active THEN
    is_active := (
      SELECT CASE 
        WHEN auth.uid() = user_uuid AND (auth.is_admin() OR auth.is_service_role()) THEN true
        ELSE false
      END
    );
  END IF;
  
  RETURN is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
