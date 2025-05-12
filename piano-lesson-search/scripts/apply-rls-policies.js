#!/usr/bin/env node

/**
 * RLSポリシーをSupabaseに適用するスクリプト
 * 実行方法: node scripts/apply-rls-policies.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 環境変数の確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数 NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていません。');
  process.exit(1);
}

// Supabaseクライアントの初期化（サービスロールキーを使用）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRlsPolicies() {
  console.log('RLSポリシーの適用を開始します...');

  try {
    // マイグレーションファイルのパス
    const migrationPath = path.join(__dirname, '../supabase/migrations/20230514_complete_rls_policies.sql');
    
    // SQLファイルの読み込み
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // PostgreSQLクエリを実行
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      throw error;
    }

    console.log('RLSポリシーが正常に適用されました！');
  } catch (error) {
    console.error('RLSポリシーの適用中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの実行
applyRlsPolicies();
