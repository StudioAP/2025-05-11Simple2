"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

type SchoolPhoto = {
  id: string;
  school_id: string;
  storage_path: string;
  photo_order: number;
};

type SchoolGalleryProps = {
  photos: SchoolPhoto[];
};

export function SchoolGallery({ photos }: SchoolGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const supabase = createClient();

  // Supabaseストレージから画像のURLを取得
  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from("school_photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-lg">
        <Image
          src={getImageUrl(photos[activeIndex].storage_path)}
          alt={`教室の写真 ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {photos.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded overflow-hidden ${
                index === activeIndex ? "ring-2 ring-primary" : ""
              }`}
            >
              <Image
                src={getImageUrl(photo.storage_path)}
                alt={`サムネイル ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
