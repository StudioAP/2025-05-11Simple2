"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

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
  const handleDragEnd = async (result: DropResult) => {
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
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>{success}</div>
        </div>
      )}

      {photos.length > 0 ? (
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            写真をドラッグ＆ドロップで並べ替えることができます。最初の写真がメイン画像として表示されます。
          </p>
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
                          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative w-20 h-20 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                              <Image
                                src={getImageUrl(photo.storage_path)}
                                alt={`教室写真 ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                              {index === 0 && (
                                <div className="absolute top-0 left-0 bg-primary text-white text-xs px-1.5 py-0.5">
                                  メイン
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">写真 {index + 1}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                                ドラッグして順序を変更
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePhoto(photo)}
                            className="flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            教室の写真がまだアップロードされていません
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            写真をアップロードして、教室の魅力をアピールしましょう
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
            className="w-full flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                アップロード中... {uploadProgress}%
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                写真をアップロード
              </>
            )}
          </Button>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              アップロードのヒント
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 ml-5 list-disc">
              <li>JPEGまたはPNG形式、2MB以下の画像ファイルをアップロードしてください</li>
              <li>写真は最大5枚までアップロードできます</li>
              <li>最初の写真がメイン画像として表示されます</li>
              <li>教室の内装や設備がわかる写真が効果的です</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
