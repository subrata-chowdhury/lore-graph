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
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      // Check if the image is already loaded
      if (img.complete && img.naturalWidth > 0) {
        setImageLoaded(true);
      } else if (img.complete && img.naturalWidth === 0) {
        // Image failed to load
        setImageLoaded(false);
      }
    }
  }, []);

  return imageLoaded ? (
    <img
      ref={imgRef}
      src={`/img/banner/${userId}`}
      alt={`${userName}'s banner`}
      onError={() => setImageLoaded(false)}
      className={`object-cover ${className}`}
    />
  ) : (
    <div
      className={`flex h-full w-full items-center justify-center bg-gray-300 text-5xl font-bold text-gray-400 dark:bg-gray-700 dark:text-gray-300 ${className}`}
    >
      {userName}
    </div>
  );
}
