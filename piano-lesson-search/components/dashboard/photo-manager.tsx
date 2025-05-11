"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type SchoolPhoto = {
  id: string;
  school_id: string;
  storage_path: string;
  photo_order: number;
};

type PhotoManagerProps = {
  schoolId: string;
  photos: SchoolPhoto[];
};

export function PhotoManager({ schoolId, photos: initialPhotos }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<SchoolPhoto[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Supabaseストレージから画像のURLを取得
  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from("school_photos").getPublicUrl(path);
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

    // 最大5枚までの制限
    if (photos.length >= 5) {
      setError("写真は最大5枚までアップロードできます");
      return;
    }

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
      // ファイル名を生成（schoolId_timestamp.拡張子）
      const fileExt = file.name.split(".").pop();
      const fileName = `${schoolId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabaseストレージにアップロード
      const { error: uploadError } = await supabase.storage
        .from("school_photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress: { loaded: number; total: number }) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          },
        });

      if (uploadError) throw uploadError;

      // データベースに写真情報を登録
      const newPhotoOrder = photos.length > 0 
        ? Math.max(...photos.map(p => p.photo_order)) + 1 
        : 0;

      const { data: newPhoto, error: dbError } = await supabase
        .from("school_photos")
        .insert({
          school_id: schoolId,
          storage_path: filePath,
          photo_order: newPhotoOrder,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 写真リストを更新
      setPhotos([...photos, newPhoto]);
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
  const handleDeletePhoto = async (photo: SchoolPhoto) => {
    if (!confirm("この写真を削除してもよろしいですか？")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      // データベースから写真情報を削除
      const { error: dbError } = await supabase
        .from("school_photos")
        .delete()
        .eq("id", photo.id);

      if (dbError) throw dbError;

      // ストレージから写真ファイルを削除
      const { error: storageError } = await supabase.storage
        .from("school_photos")
        .remove([photo.storage_path]);

      if (storageError) throw storageError;

      // 写真リストを更新
      setPhotos(photos.filter(p => p.id !== photo.id));
      setSuccess("写真が削除されました");
    } catch (err) {
      console.error("写真削除エラー:", err);
      setError("写真の削除に失敗しました。もう一度お試しください。");
    }
  };

  // 写真の並べ替え処理
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 並べ替え後の順序を更新
    const updatedItems = items.map((item, index) => ({
      ...item,
      photo_order: index,
    }));

    setPhotos(updatedItems);

    // データベースの順序を更新
    try {
      setError(null);
      setSuccess(null);

      // 各写真の順序を更新
      for (const photo of updatedItems) {
        const { error } = await supabase
          .from("school_photos")
          .update({ photo_order: photo.photo_order })
          .eq("id", photo.id);

        if (error) throw error;
      }

      setSuccess("写真の順序が更新されました");
    } catch (err) {
      console.error("写真順序更新エラー:", err);
      setError("写真の順序の更新に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">教室の写真</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {photos.length}/5枚
        </div>
      </div>

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

      {photos.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="photos">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {photos.map((photo, index) => (
                  <Draggable key={photo.id} draggableId={photo.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-20 h-20 overflow-hidden rounded-md">
                            <Image
                              src={getImageUrl(photo.storage_path)}
                              alt={`教室写真 ${index + 1}`}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">写真 {index + 1}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ドラッグして順序を変更できます
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePhoto(photo)}
                        >
                          削除
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            教室の写真がまだアップロードされていません
          </p>
        </div>
      )}

      {photos.length < 5 && (
        <div className="mt-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png"
            className="hidden"
          />
          <Button
            onClick={handleSelectFile}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? `アップロード中... ${uploadProgress}%` : "写真をアップロード"}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            ※ JPEGまたはPNG形式、2MB以下の画像ファイルをアップロードしてください。
            <br />
            ※ 写真は最大5枚までアップロードできます。
          </p>
        </div>
      )}
    </div>
  );
}
