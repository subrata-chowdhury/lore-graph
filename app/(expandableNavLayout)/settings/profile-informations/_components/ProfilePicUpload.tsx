"use client";
import { getInitials } from "@/utils/getInitials";
import React, { useRef, useState, useEffect } from "react";
import { BiPencil, BiTrash } from "react-icons/bi";
import { FiDownload } from "react-icons/fi";

interface ProfilePicUploadProps {
  userId?: string;
  userName?: string;
  imageTimestamp: number;
  onImageChange: (file: File | null) => void;
}

const ProfilePicUpload = ({
  userId,
  userName,
  imageTimestamp,
  onImageChange,
}: ProfilePicUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already loaded (logic inspired by ProfilePic.tsx)
  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      if (img.complete && img.naturalWidth > 0) {
        setImageLoaded(true);
      }
    }
  }, [previewUrl, userId, imageTimestamp]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageChange(file);
      setImageLoaded(false); // Reset loading state for new image
    }
  }

  const profilePicUrl = previewUrl
    ? previewUrl
    : userId
      ? `/img/profile/${userId}?t=${imageTimestamp}`
      : null;

  const handleDownload = (e: React.MouseEvent) => {
    if (profilePicUrl) {
      const a = document.createElement("a");
      a.href = profilePicUrl;
      a.target = "_blank";
      a.download = "profile-picture.jpg";
      a.click();
      e.stopPropagation();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onImageChange(null);
    setImageLoaded(false);
  };

  return (
    <div className="flex flex-col">
      <div className="text-sm font-semibold">Profile Picture</div>
      <div className="mt-1 mb-2 text-sm text-black/60">
        This image will be displayed on your profile.
      </div>
      <div
        className="group relative flex aspect-square h-64 w-64 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-black/20 bg-black/10 text-sm text-black/50 xl:h-80 xl:w-80"
        onClick={() => imgInputRef.current?.click()}
      >
        {profilePicUrl && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-all group-hover:opacity-100">
            <div className="cursor-pointer rounded-full bg-white/20 p-3 text-white hover:bg-white/30">
              <BiPencil size={24} />
            </div>
            <div
              className="cursor-pointer rounded-full bg-white/20 p-3 text-white hover:bg-white/30"
              onClick={handleDownload}
            >
              <FiDownload size={24} />
            </div>
            <div
              className="cursor-pointer rounded-full bg-white/20 p-3 text-white hover:bg-white/30"
              onClick={handleDelete}
            >
              <BiTrash size={24} />
            </div>
          </div>
        )}

        {profilePicUrl ? (
          <>
            <img
              ref={imgRef}
              src={profilePicUrl}
              alt="Profile"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {!imageLoaded && (
              <div className="flex h-full w-full items-center justify-center bg-black/20 text-5xl font-bold text-black/60 dark:bg-gray-700 dark:text-gray-300">
                {getInitials(userName || "")}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <BiPencil size={32} />
            <span>Select Image</span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={imgInputRef}
          onChange={handleImageChange}
        />
      </div>
    </div>
  );
};

export default ProfilePicUpload;
