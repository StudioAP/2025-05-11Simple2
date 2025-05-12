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
  description: 'テスト用の教室です',
  area: '東京都渋谷区',
};

// 環境変数の読み込み
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.local';
console.log(`環境変数を ${envPath} から読み込みます`);
dotenv.config({ path: envPath });

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
    const { data, error: authError } = await supabase.auth.admin.listUsers();
    
    let userId;
    let existingUser = null;
    
    if (data && data.users) {
      existingUser = data.users.find(user => user.email === TEST_USER.email);
    }
    
    if (existingUser) {
      userId = existingUser.id;
      console.log(`ユーザー ${TEST_USER.email} は既に存在します。ID: ${userId}`);
      
      // 既存ユーザーのプロフィールと教室情報を確認し、必要に応じて更新
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!profileData) {
        // プロフィールが存在しない場合は作成
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
      } else {
        console.log('プロフィールは既に存在します');
      }
      
      // 教室情報を確認
      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!schoolData) {
        // 教室情報が存在しない場合は作成
        const { error: schoolError } = await supabase
          .from('schools')
          .insert({
            user_id: userId,
            name: TEST_SCHOOL.name,
            description: TEST_SCHOOL.description,
            area: TEST_SCHOOL.area,
            is_published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (schoolError) {
          throw new Error(`教室情報作成エラー: ${schoolError.message}`);
        }
        console.log('教室情報作成成功');
      } else {
        console.log('教室情報は既に存在します');
      }
    } else {
      // ユーザーが存在しない場合は新規作成
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        email_confirm: true,
      });

      if (userError) {
        throw new Error(`ユーザー作成エラー: ${userError.message}`);
      }

      userId = userData.user.id;
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
          description: TEST_SCHOOL.description,
          area: TEST_SCHOOL.area,
          is_published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (schoolError) {
        throw new Error(`教室情報作成エラー: ${schoolError.message}`);
      }

      console.log('教室情報作成成功');
    }
    
    console.log('テスト用ユーザーの作成または確認が完了しました。');
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
