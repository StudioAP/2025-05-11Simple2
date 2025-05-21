"use client";

import { AccessibleImage } from "@/components/ui/accessible-image";
import { getStorageImageUrl } from "@/lib/media-utils";

interface SchoolImageProps {
  schoolId: string;
  imagePath: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function SchoolImage({ 
  schoolId, 
  imagePath, 
  width, 
  height, 
  priority = false,
  className = "" 
}: SchoolImageProps) {
  const imageUrl = getStorageImageUrl('school_photos', imagePath);
  
  return (
    <AccessibleImage
      src={imageUrl || '/images/placeholder-school.jpg'}
      alt={`教室の写真`}
      width={width}
      height={height}
      priority={priority}
      className={className}
      fallbackText="画像の読み込みに失敗しました"
    />
  );
}
