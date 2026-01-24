"use client";
import React, { useRef, useState, useEffect } from "react";
import { BiPencil, BiTrash } from "react-icons/bi";
import { FiDownload } from "react-icons/fi";

interface BannerImageUploadProps {
  userId?: string;
  userName?: string;
  imageTimestamp: number;
  onImageChange: (file: File | null) => void;
}

const BannerImageUpload = ({
  userId,
  userName,
  imageTimestamp,
  onImageChange,
}: BannerImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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
      setImageLoaded(false);
    }
  }

  const bannerUrl = previewUrl
    ? previewUrl
    : userId
      ? `/img/banner/${userId}?t=${imageTimestamp}`
      : null;

  const handleDownload = (e: React.MouseEvent) => {
    if (bannerUrl) {
      const a = document.createElement("a");
      a.href = bannerUrl;
      a.target = "_blank";
      a.download = "banner-image.jpg";
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
    <div className="mb-6 flex flex-col">
      <div className="text-sm font-semibold">Banner Image</div>
      <div className="mt-1 mb-2 text-sm text-black/60">
        This image will be displayed as your profile banner.
      </div>
      <div
        className="group relative flex aspect-3/1 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-black/20 bg-black/10 text-sm text-black/50"
        onClick={() => imgInputRef.current?.click()}
      >
        {bannerUrl && (
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

        {bannerUrl ? (
          <>
            <img
              ref={imgRef}
              src={bannerUrl}
              alt="Banner"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {!imageLoaded && (
              <div className="flex h-full w-full items-center justify-center bg-gray-300 text-5xl font-bold text-gray-400 dark:bg-gray-700 dark:text-gray-300">
                {userName}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <BiPencil size={32} />
            <span>Select Banner Image</span>
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

export default BannerImageUpload;
