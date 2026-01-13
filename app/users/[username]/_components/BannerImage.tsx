"use client";
import { useState, useEffect, useRef } from "react";

export default function BannerImage({
  userId,
  userName,
  className = "",
}: {
  userId: string;
  userName: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      // Check if the image is already done loading but has no width (failed)
      if (img.complete && img.naturalWidth === 0) {
        setImageError(true);
      }
    }
  }, []);

  if (imageError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-300 text-5xl font-bold text-gray-400 dark:bg-gray-700 dark:text-gray-300 ${className}`}
      >
        {userName}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={`/img/banner/${userId}`}
      alt={`${userName}'s banner`}
      onError={() => setImageError(true)}
      className={`object-cover ${className}`}
    />
  );
}
