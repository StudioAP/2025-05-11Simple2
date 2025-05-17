/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 環境変数のロード
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('Supabase URL:', supabaseUrl);
console.log('Setting up test database...');

// Supabaseクライアントの初期化
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * テスト用スキーマのセットアップ
 */
async function setupSchema() {
  try {
    // プロファイルテーブル
    await supabase.rpc('create_table_profiles', {});
    
    // 教室関連テーブル
    await supabase.rpc('create_school_tables', {});
    
    // サブスクリプションテーブル
    await supabase.rpc('create_subscription_tables', {});
    
    // お問い合わせテーブル
    await supabase.rpc('create_contact_tables', {});
    
    console.log('Schema setup completed.');
  } catch (error) {
    console.error('Error setting up schema:', error.message);
  }
}

/**
 * テスト用のRLSポリシーのセットアップ
 */
async function setupRLSPolicies() {
  try {
    await supabase.rpc('setup_rls_policies', {});
    console.log('RLS policies setup completed.');
  } catch (error) {
    console.error('Error setting up RLS policies:', error.message);
  }
}

/**
 * テスト用のサンプルデータ生成
 */
async function generateTestData() {
  try {
    // 教室種別の登録
    const schoolTypes = [
      { id: 1, name: 'ピアノ教室' },
      { id: 2, name: 'リトミック教室' },
      { id: 3, name: 'ピアノ・リトミック複合教室' }
    ];
    
    await supabase.from('school_types').insert(schoolTypes);
    
    // テストユーザーの作成
    const { data: user1, error: userError1 } = await supabase.auth.signUp({
      email: 'testuser1@example.com',
      password: 'password123',
    });
    
    if (userError1) throw userError1;
    
    const { data: user2, error: userError2 } = await supabase.auth.signUp({
      email: 'testuser2@example.com',
      password: 'password123',
    });
    
    if (userError2) throw userError2;
    
    // プロフィール情報の登録
    await supabase.from('profiles').insert([
      {
        id: user1.user.id,
        full_name: 'テストユーザー1',
        email: 'testuser1@example.com',
      },
      {
        id: user2.user.id,
        full_name: 'テストユーザー2',
        email: 'testuser2@example.com',
      }
    ]);
    
    // テスト用教室データの作成
    const schools = [
      {
        name: 'ピアノ教室テスト1',
        description: 'テスト用のピアノ教室です。初心者から上級者まで対応しています。',
        address: '東京都渋谷区〇〇1-2-3',
        access: '渋谷駅から徒歩10分',
        tel: '03-1234-5678',
        email: 'piano1@example.com',
        website: 'https://example.com/piano1',
        business_hours: '平日 10:00-19:00, 土日 10:00-17:00',
        holidays: '月曜日・祝日',
        lesson_fee: '月額8,000円〜',
        trial_lesson: 'あり（無料）',
        features: ['駅近', '個人レッスン', 'コンクール対策'],
        lesson_style: '個人レッスン中心',
        target_audience: '幼児から大人まで',
        facility_info: 'グランドピアノ2台完備',
        school_type_id: 1,
        user_id: user1.user.id,
        is_active: true,
        area: '東京都渋谷区',
        keywords: 'ピアノ,初心者,コンクール,子供',
      },
      {
        name: 'リトミック教室テスト',
        description: 'テスト用のリトミック教室です。音楽の楽しさを体験しながら学べます。',
        address: '東京都新宿区〇〇4-5-6',
        access: '新宿駅から徒歩8分',
        tel: '03-8765-4321',
        email: 'rhythm@example.com',
        website: 'https://example.com/rhythm',
        business_hours: '平日 13:00-18:00, 土 10:00-15:00',
        holidays: '日曜日・祝日',
        lesson_fee: '月額7,000円〜',
        trial_lesson: 'あり（1,000円）',
        features: ['少人数制', '親子参加', '楽器経験不要'],
        lesson_style: 'グループレッスン',
        target_audience: '0歳〜小学生',
        facility_info: '広い専用スタジオ完備',
        school_type_id: 2,
        user_id: user2.user.id,
        is_active: true,
        area: '東京都新宿区',
        keywords: 'リトミック,幼児,親子,音楽',
      }
    ];
    
    await supabase.from('schools').insert(schools);
    
    console.log('Test data generation completed.');
  } catch (error) {
    console.error('Error generating test data:', error.message);
  }
}

// メイン処理
async function main() {
  try {
    await setupSchema();
    await setupRLSPolicies();
    await generateTestData();
    console.log('Test database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up test database:', error.message);
    process.exit(1);
  }
}

main(); 