/**
 * テスト用ユーザーアカウント作成スクリプト
 * 
 * このスクリプトは、E2Eテスト用のユーザーアカウントを作成します。
 * 実行方法: ts-node scripts/create-test-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// テスト用データの定義
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

const TEST_SCHOOL = {
  name: 'テスト音楽教室',
  address: '東京都渋谷区1-1-1',
  phone: '03-1234-5678',
};

// 環境変数の読み込み
dotenv.config({ path: '.env.local' });

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません。.env.localファイルを確認してください。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * テスト用ユーザーを作成する関数
 */
async function createTestUser() {
  try {
    console.log('テスト用ユーザーの作成を開始します...');

    // 既存のユーザーを確認
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', TEST_USER.email);

    if (existingUsers && existingUsers.length > 0) {
      console.log(`ユーザー ${TEST_USER.email} は既に存在します。`);
      return existingUsers[0].id;
    }

    // ユーザーの作成
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
    });

    if (userError) {
      throw new Error(`ユーザー作成エラー: ${userError.message}`);
    }

    const userId = userData.user.id;
    console.log(`ユーザー作成成功: ${userId}`);

    // プロフィール情報の作成
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: TEST_USER.email,
        full_name: 'テストユーザー',
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      throw new Error(`プロフィール作成エラー: ${profileError.message}`);
    }

    console.log('プロフィール作成成功');

    // 教室情報の作成
    const { error: schoolError } = await supabase
      .from('schools')
      .insert({
        user_id: userId,
        name: TEST_SCHOOL.name,
        address: TEST_SCHOOL.address,
        phone: TEST_SCHOOL.phone,
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (schoolError) {
      throw new Error(`教室情報作成エラー: ${schoolError.message}`);
    }

    console.log('教室情報作成成功');
    console.log('テスト用ユーザーの作成が完了しました。');
    
    return userId;
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの実行
createTestUser()
  .then(() => {
    console.log('スクリプトの実行が完了しました。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('スクリプトの実行中にエラーが発生しました:', error);
    process.exit(1);
  });
