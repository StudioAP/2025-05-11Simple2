import { FileOptions } from '@supabase/storage-js';

declare module '@supabase/storage-js' {
  interface FileOptions {
    onUploadProgress?: (progress: { loaded: number; total: number }) => void;
  }
}

// React.FormEventの型拡張
declare global {
  namespace React {
    interface FormEvent<T = Element> extends SyntheticEvent<T> {
      // 既存の定義を保持
    }
  }
}
