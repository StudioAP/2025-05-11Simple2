-- 問い合わせメッセージ用のテーブル
-- すでにschool_contactsテーブルが存在するため、contact_messagesテーブル名を確認

-- まずcontact_messagesテーブルが存在するか確認
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_messages'
  ) THEN
    RAISE NOTICE 'テーブル contact_messages はすでに存在します。';
  ELSE
    -- もしcontact_messagesテーブルが存在しない場合は作成
    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- RLSポリシーの設定
    ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

    -- 送信者は自分のメッセージのみ参照可能
    CREATE POLICY "ユーザーは自分のメッセージのみ参照可能" ON contact_messages
      FOR SELECT
      USING (
        user_id = auth.uid()
      );

    -- 教室運営者は自分の教室への問い合わせのみ閲覧可能
    CREATE POLICY "教室運営者は自分の教室への問い合わせのみ閲覧可能" ON contact_messages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM schools
          WHERE schools.id = contact_messages.school_id
          AND schools.user_id = auth.uid()
        )
      );

    -- 管理者とサービスロールはすべてのメッセージを閲覧可能
    CREATE POLICY "管理者とサービスロールはすべてのメッセージを閲覧可能" ON contact_messages
      FOR ALL
      USING (
        auth.is_admin() OR
        auth.is_service_role()
      );

    -- 誰でも問い合わせの作成が可能
    CREATE POLICY "誰でも問い合わせの作成が可能" ON contact_messages
      FOR INSERT
      WITH CHECK (true);

    RAISE NOTICE 'テーブル contact_messages を作成しました。';
  END IF;
END $$;
