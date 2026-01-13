"use client";
import { useState, useEffect, useRef } from "react";

export default function ProfilePic({
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

  // Helper for initials
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (imageError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-300 text-5xl font-bold text-gray-400 dark:bg-gray-700 dark:text-gray-300 ${className}`}
      >
        {getInitials(userName)}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={`/img/profile/${userId}`}
      alt={`${userName}'s profile`}
      onError={() => setImageError(true)}
      className={`object-cover ${className}`}
    />
  );
}
