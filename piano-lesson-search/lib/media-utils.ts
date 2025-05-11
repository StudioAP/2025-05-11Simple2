/**
 * メディア管理と画像最適化のためのユーティリティ関数
 */

import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 画像アップロード時のオプション
 */
export interface ImageUploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  folder?: string;
  fileName?: string;
  contentType?: string;
  onProgress?: (progress: number) => void;
}

/**
 * 画像をリサイズする
 * @param file 画像ファイル
 * @param maxWidth 最大幅
 * @param maxHeight 最大高さ
 * @param quality 品質（0-1）
 * @returns リサイズされた画像Blob
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // 元の画像サイズ
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      // リサイズ後のサイズを計算
      let newWidth = originalWidth;
      let newHeight = originalHeight;
      
      if (originalWidth > maxWidth || originalHeight > maxHeight) {
        const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
        newWidth = Math.floor(originalWidth * ratio);
        newHeight = Math.floor(originalHeight * ratio);
      }
      
      // キャンバスを作成してリサイズ
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Blobに変換
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        file.type,
        quality
      );
      
      // 画像のURLを解放
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
  });
}

/**
 * 画像をSupabaseストレージにアップロードする
 * @param file 画像ファイル
 * @param options アップロードオプション
 * @returns アップロードされた画像のURL
 */
export async function uploadImage(
  file: File,
  options: ImageUploadOptions = {}
): Promise<string> {
  try {
    const {
      maxSizeMB = 1,
      maxWidthOrHeight = 1200,
      quality = 0.8,
      folder = 'school_images',
      fileName,
      contentType,
      onProgress
    } = options;
    
    // ファイルサイズをチェック
    const fileSizeMB = file.size / (1024 * 1024);
    let processedFile: File | Blob = file;
    
    // 最大サイズを超える場合はリサイズ
    if (fileSizeMB > maxSizeMB) {
      processedFile = await resizeImage(file, maxWidthOrHeight, maxWidthOrHeight, quality);
    }
    
    // ファイル名の生成
    const fileExt = file.name.split('.').pop();
    const generatedFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${generatedFileName}`;
    
    // アップロード
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        contentType: contentType || file.type,
        upsert: false,
        ...(onProgress && { onUploadProgress: (progress) => onProgress(progress.percent || 0) })
      });
    
    if (error) throw error;
    
    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * 複数の画像をアップロードする
 * @param files 画像ファイルの配列
 * @param options アップロードオプション
 * @returns アップロードされた画像のURL配列
 */
export async function uploadMultipleImages(
  files: File[],
  options: ImageUploadOptions = {}
): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

/**
 * Supabaseストレージから画像を削除する
 * @param imageUrl 削除する画像のURL
 * @returns 成功したかどうか
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // URLからパスを抽出
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/media\/(.+)/);
    
    if (!pathMatch || !pathMatch[1]) {
      throw new Error('Invalid image URL format');
    }
    
    const filePath = pathMatch[1];
    
    // 画像を削除
    const { error } = await supabase.storage
      .from('media')
      .remove([filePath]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

/**
 * 画像のメタデータを取得する
 * @param imageUrl 画像のURL
 * @returns 画像のメタデータ
 */
export async function getImageMetadata(imageUrl: string): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      // 画像のサイズを取得
      const width = img.width;
      const height = img.height;
      
      // 画像の形式を推測
      const format = imageUrl.split('.').pop()?.toLowerCase() || 'unknown';
      
      // サイズは不明（URLからは取得できない）
      const size = 0;
      
      resolve({
        width,
        height,
        format,
        size
      });
      
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
  });
}

/**
 * 画像のプレビューURLを生成する
 * @param file 画像ファイル
 * @returns プレビューURL
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * プレビューURLを解放する
 * @param previewUrl プレビューURL
 */
export function revokeImagePreview(previewUrl: string): void {
  URL.revokeObjectURL(previewUrl);
}

/**
 * 画像のアスペクト比を計算する
 * @param width 幅
 * @param height 高さ
 * @returns アスペクト比（width:height）
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}
