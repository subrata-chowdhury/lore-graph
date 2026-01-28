"use client";
import fetcher from "@/libs/fetcher";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { BiTrash } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";

const UploadToCloudinary = ({
  imgUrl,
  apiPath,
  onUpload,
}: {
  imgUrl?: string;
  apiPath: string;
  onUpload: (url: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);

  console.log(imgUrl);
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.size < 900 * 1024) {
        // 900 KB
        setLoading(true);
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(apiPath, {
          method: "POST",
          body: form, // ✅ Automatically sets Content-Type to "multipart/form-data"
        });
        const url = (await res.json()).url || "";
        onUpload(url);
        setLoading(false);
      } else {
        toast.warning("File size should be less than 900KB");
      }
    }
  }

  async function deleteFile() {
    if (!imgUrl) {
      toast.error("No image to delete");
      return;
    }
    setLoading(true);
    const res = await fetcher.delete(apiPath.replace(/^\/api/, ""), {
      publicId: imgUrl.split("/").pop()?.split(".")[0] || null,
    });
    if (res.error) {
      toast.error(res.error);
    } else {
      onUpload("");
      toast.success("Image deleted successfully");
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center space-x-3 rounded border-2 border-gray-300/50 px-3 py-2">
      {/* If imageName is null, don't show anything */}
      <div className="mr-2 flex-1 cursor-pointer truncate text-gray-500" onClick={() => {}}>
        {(!loading && imgUrl && imgUrl.length > 0 && imgUrl.split("/").pop()?.split(".")[0]) ||
          null}
      </div>
      <div>
        {!loading && (
          <button onClick={() => imageInput.current?.click()} className="cursor-pointer">
            <CgAttachment />
          </button>
        )}
        {loading && (
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-b-transparent"></div>
          </div>
        )}
      </div>
      {!loading && imgUrl && imgUrl.length > 0 && (
        <button onClick={() => window.open(imgUrl, "_blank")} className="cursor-pointer">
          <BsEye />
        </button>
      )}
      <input
        key={imgUrl}
        ref={imageInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden w-full"
      />
      {!loading && imgUrl && imgUrl.length > 0 && (
        <span className="turncate cursor-pointer text-red-500" onClick={() => deleteFile()}>
          <BiTrash />
        </span>
      )}
    </div>
  );
};

export default UploadToCloudinary;
