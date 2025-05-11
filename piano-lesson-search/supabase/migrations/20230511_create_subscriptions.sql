-- サブスクリプションテーブルの作成
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLSポリシーの設定
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 自分のサブスクリプションのみ読み取り可能
CREATE POLICY "ユーザーは自分のサブスクリプションのみ参照可能" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 管理者のみがサブスクリプションを更新可能（ウェブフック経由）
CREATE POLICY "管理者のみサブスクリプションを更新可能" ON subscriptions
  FOR INSERT WITH CHECK (
    -- ウェブフックサービスロールのみが更新可能
    (SELECT is_service_role() FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "管理者のみサブスクリプションを更新可能" ON subscriptions
  FOR UPDATE USING (
    -- ウェブフックサービスロールのみが更新可能
    (SELECT is_service_role() FROM auth.users WHERE id = auth.uid())
  );

-- トリガー関数の作成（updated_atを自動更新）
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの設定
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();
