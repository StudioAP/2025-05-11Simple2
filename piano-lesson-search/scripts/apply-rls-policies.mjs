#!/usr/bin/env node

/**
 * RLSポリシーをSupabaseに適用するスクリプト
 * 実行方法: node scripts/apply-rls-policies.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config'; // dotenvの読み込み方を変更
import { fileURLToPath } from 'url'; // __dirname の代わりに利用

// __dirname と __filename は ESM では直接利用できないため、代替手段を用意
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // 注意: supabase.rpc('exec_sql', { sql }) はカスタムのRPC関数を想定しています。
    // Supabaseの標準機能でSQLを直接実行する場合は、supabase.sql() を使用します。
    // ここでは元のスクリプトの動作を維持するため、rpc呼び出しを残します。
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