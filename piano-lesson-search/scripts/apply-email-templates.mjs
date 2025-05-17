#!/usr/bin/env node

/**
 * Supabaseにメールテンプレートを適用するスクリプト
 * 実行方法: node scripts/apply-email-templates.mjs
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

async function applyEmailTemplates() {
  console.log('メールテンプレートの適用を開始します...');

  try {
    const templatesDir = path.join(__dirname, '../supabase/email-templates');
    
    // 確認メールテンプレート
    const confirmationTemplate = fs.readFileSync(path.join(templatesDir, 'confirmation.html'), 'utf8');
    
    // パスワードリセットメールテンプレート
    const resetPasswordTemplate = fs.readFileSync(path.join(templatesDir, 'reset-password.html'), 'utf8');

    // メール設定を更新
    const { error } = await supabase.rpc('update_email_templates', {
      confirmation_template: confirmationTemplate,
      reset_password_template: resetPasswordTemplate,
      site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      redirect_to: '/auth/callback',
      enable_signup: true
    });

    if (error) {
      throw error;
    }

    console.log('メールテンプレートが正常に適用されました！');
  } catch (error) {
    console.error('メールテンプレートの適用中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの実行
applyEmailTemplates(); 