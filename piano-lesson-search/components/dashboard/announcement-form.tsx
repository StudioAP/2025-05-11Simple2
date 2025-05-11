"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Announcement = {
  id: string;
  school_id: string;
  content: string;
  photo_path: string | null;
  created_at: string;
};

type AnnouncementFormProps = {
  schoolId: string;
  initialData: Announcement | null;
};

export function AnnouncementForm({ schoolId, initialData }: AnnouncementFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialData?.content || "");
  const [photoPath, setPhotoPath] = useState(initialData?.photo_path || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Supabaseストレージから画像のURLを取得
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("announcement_photos").getPublicUrl(path);
    return data.publicUrl;
  };

  // ファイル選択ダイアログを開く
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 写真のアップロード処理
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // ファイルサイズの制限（2MB）
    if (file.size > 2 * 1024 * 1024) {
      setError("ファイルサイズは2MB以下にしてください");
      return;
    }

    // ファイル形式の制限（JPEG, PNG）
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("JPEGまたはPNG形式の画像ファイルをアップロードしてください");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    try {
      // 既存の写真があれば削除
      if (photoPath) {
        await supabase.storage
          .from("announcement_photos")
          .remove([photoPath]);
      }

      // ファイル名を生成（schoolId_timestamp.拡張子）
      const fileExt = file.name.split(".").pop();
      const fileName = `${schoolId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabaseストレージにアップロード
      const { error: uploadError } = await supabase.storage
        .from("announcement_photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress: { loaded: number; total: number }) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          },
        });

      if (uploadError) throw uploadError;

      setPhotoPath(filePath);
      setSuccess("写真がアップロードされました");

      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("写真アップロードエラー:", err);
      setError("写真のアップロードに失敗しました。もう一度お試しください。");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 写真の削除処理
  const handleDeletePhoto = async () => {
    if (!photoPath) return;

    if (!confirm("この写真を削除してもよろしいですか？")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      // ストレージから写真ファイルを削除
      const { error: storageError } = await supabase.storage
        .from("announcement_photos")
        .remove([photoPath]);

      if (storageError) throw storageError;

      setPhotoPath(null);
      setSuccess("写真が削除されました");
    } catch (err) {
      console.error("写真削除エラー:", err);
      setError("写真の削除に失敗しました。もう一度お試しください。");
    }
  };

  // お知らせの保存処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // バリデーション
      if (!content.trim()) {
        throw new Error("お知らせ内容を入力してください");
      }

      if (content.length > 200) {
        throw new Error("お知らせ内容は200文字以内で入力してください");
      }

      const announcementData = {
        school_id: schoolId,
        content,
        photo_path: photoPath,
      };

      if (initialData) {
        // 更新
        const { error } = await supabase
          .from("school_announcements")
          .update(announcementData)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        // 新規作成
        const { error } = await supabase
          .from("school_announcements")
          .insert(announcementData);

        if (error) throw error;
      }

      setSuccess("お知らせが保存されました");
      router.refresh();
    } catch (err: any) {
      console.error("お知らせ保存エラー:", err);
      setError(err.message || "お知らせの保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium">
          お知らせ内容 <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="最新のお知らせを入力してください"
          rows={5}
          maxLength={200}
          disabled={isSaving}
          className={error && !content.trim() ? "border-red-500" : ""}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {content.length}/200文字
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          お知らせ写真
        </label>

        {photoPath ? (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="relative w-full h-[200px] overflow-hidden rounded-md mb-4">
              <Image
                src={getImageUrl(photoPath) || ""}
                alt="お知らせ写真"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeletePhoto}
              disabled={isSaving}
            >
              写真を削除
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              写真がアップロードされていません
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSelectFile}
              disabled={isUploading || isSaving}
            >
              {isUploading ? `アップロード中... ${uploadProgress}%` : "写真をアップロード"}
            </Button>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ※ JPEGまたはPNG形式、2MB以下の画像ファイルをアップロードしてください。
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isSaving}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
