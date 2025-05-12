/**
 * テスト環境用のヘルパー関数
 * 
 * テスト環境では日本語全文検索設定がないため、
 * 通常のSupabase操作がエラーになる場合があります。
 * このモジュールは、テスト環境でも動作するように
 * 代替実装を提供します。
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { isTestEnvironment } from './env';

/**
 * テスト環境用のschoolsテーブル保存処理
 * 全文検索を使わない代替実装を提供します
 * 
 * @param supabase Supabaseクライアント
 * @param data 保存するデータ
 * @param id 更新時の学校ID（新規作成時はundefined）
 * @returns 処理結果
 */
export const saveSchoolForTest = async (
  supabase: SupabaseClient,
  data: any,
  id?: string
) => {
  try {
    // テスト環境でない場合は何もせずnullを返す
    if (!isTestEnvironment()) {
      return null;
    }

    // 更新の場合
    if (id) {
      return await supabase
        .from("schools")
        .update(data)
        .eq("id", id);
    }
    
    // 新規作成の場合
    return await supabase
      .from("schools")
      .insert(data);
  } catch (error) {
    console.error("テスト用保存処理でエラー:", error);
    throw error;
  }
};
