"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface AccessibleImageProps extends Omit<ImageProps, "alt"> {
  alt: string;
  fallbackText?: string;
}

export function AccessibleImage({
  alt,
  fallbackText,
  onError,
  ...props
}: AccessibleImageProps) {
  const [error, setError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    if (onError) {
      onError(e);
    }
  };

  if (error && fallbackText) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md"
        style={{ width: props.width, height: props.height }}
        role="img"
        aria-label={alt}
      >
        <p className="text-center p-4 text-sm">{fallbackText}</p>
      </div>
    );
  }

  return <Image alt={alt} onError={handleError} {...props} />;
}
