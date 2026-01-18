"use client";
import Lore from "@/app/_components/Lore";
import fetcher from "@/libs/fetcher";
import { LoreType } from "@/types/loreTypes";
import { Optional } from "@/types/types";
import Dropdown from "@/ui/components/Dropdown";
import Input from "@/ui/components/Inputs/Input";
import TagInput from "@/ui/components/Inputs/TagInput";
import TextAreaInput from "@/ui/components/Inputs/TextAreaInput";
import { getYouTubeID } from "@/utils/videoIdGetter";
import React, { useRef, useState } from "react";
import { BiPencil, BiTrash } from "react-icons/bi";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";

type Props = {
  loreData: Optional<
    Omit<
      LoreType,
      | "createdAt"
      | "updatedAt"
      | "likesCount"
      | "dislikesCount"
      | "viewsCount"
      | "createdBy"
      | "createdById"
    >,
    "_id"
  >;
  onLoreDataChange: (
    updatedLore: Optional<
      Omit<
        LoreType,
        | "createdAt"
        | "updatedAt"
        | "likesCount"
        | "dislikesCount"
        | "viewsCount"
        | "createdBy"
        | "createdById"
      >,
      "_id"
    >
  ) => void;
  onSave?: () => void;
};

const LoreForm = ({ loreData, onLoreDataChange = () => {}, onSave = () => {} }: Props) => {
  const [error, setError] = useState({
    field: "",
    msg: "",
  });
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onLoreDataChange({ ...loreData, thumbnailUrl: url });
    }
  }

  async function fetchVideoDetails() {
    const youtubeId = getYouTubeID(loreData?.src || "");
    if (youtubeId) {
      await fetcher
        .get<{
          data: {
            title: string;
            description: string;
            thumbnails: string;
            tags: string[];
            isEmbeddable: boolean;
            isPublic: boolean;
          };
        }>(`/super-admin/video-details?videoId=${youtubeId}`)
        .then((data) => {
          if (data.body?.data) {
            setError({ field: "", msg: "" });
            if (!data.body.data.isEmbeddable) {
              setError({ field: "src", msg: "This video is not embeddable" });
              toast.error("This video is not embeddable");
              return;
            }
            if (!data.body.data.isPublic) {
              setError({ field: "src", msg: "This video is not public" });
              toast.error("This video is not public");
              return;
            }
            onLoreDataChange({
              ...loreData,
              title: data.body.data.title,
              description: data.body.data.description,
              thumbnailUrl: data.body.data.thumbnails,
              tags: data.body.data.tags || [],
            });
          }
        })
        .catch((err) => {
          console.log(err);
          // toast.error("Error fetching video details");
        });
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 justify-between gap-8 overflow-auto bg-white p-6 px-8">
      <div>
        <div className="mb-4 flex gap-6">
          <div>
            <div className="mb-2 flex flex-col gap-1">
              <div className={`text-sm font-semibold`}>Type</div>
              <div className="text-sm text-black/60">Select the type of lore.</div>
            </div>
            <Dropdown
              width={"200px"}
              value={loreData?.type || "video"}
              options={[
                { label: "Video", value: "video" },
                { label: "YouTube", value: "youtube" },
                { label: "Post", value: "post" },
              ]}
              onChange={(option) =>
                onLoreDataChange({ ...loreData, type: option.value as LoreType["type"] })
              }
              containerClassName="text-sm capitalize"
              mainContainerClassName="pl-3"
            />
          </div>
          <div>
            <div className="mb-2 flex flex-col gap-1">
              <div className={`text-sm font-semibold`}>Visibility</div>
              <div className="text-sm text-black/60">Select the visibility of the lore.</div>
            </div>
            <Dropdown
              width={"200px"}
              value={loreData?.visibility || "private"}
              options={[
                { label: "Public", value: "public" },
                { label: "Private", value: "private" },
              ]}
              onChange={(option) =>
                onLoreDataChange({
                  ...loreData,
                  visibility: option.value as LoreType["visibility"],
                })
              }
              containerClassName="text-sm"
              mainContainerClassName="pl-3"
            />
          </div>
        </div>
        {loreData?.type === "youtube" && (
          <div className="flex gap-3">
            <Input
              label="Source"
              description="Source URL for the youtube video."
              value={loreData?.src || ""}
              onChange={(val) => onLoreDataChange({ ...loreData, src: val })}
              placeholder="Enter youtube video link"
              max={150}
              containerClass="mb-4 flex-1"
              labelClass="text-sm font-semibold"
              inputClass="text-sm"
              error={error.field === "src" ? error.msg : ""}
            />
            <button
              disabled={!loreData?.src}
              className={`mt-auto mb-4 rounded-full bg-black/20 px-5 py-2 text-sm font-semibold hover:bg-black/25 ${
                !loreData?.src ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } ${error.field === "src" ? "mb-9" : ""}`}
              onClick={() =>
                toast.promise(fetchVideoDetails, {
                  pending: "Fetching video details...",
                  success: "Details fetched successfully",
                  error: "Error fetching video details",
                })
              }
            >
              Fetch Details
            </button>
          </div>
        )}
        <TextAreaInput
          label="Title (required)"
          description="This title will also consider as meta title."
          value={loreData?.title || ""}
          onChange={(val) => onLoreDataChange({ ...loreData, title: val })}
          placeholder="Enter lore title"
          max={100}
          containerClass="mb-4"
          inputClass="resize-none"
        />
        <TextAreaInput
          label="Description (required)"
          description="This description will also consider as meta description."
          value={loreData?.description || ""}
          onChange={(val) => onLoreDataChange({ ...loreData, description: val })}
          placeholder="Enter lore description"
          containerClass="mb-4"
          inputClass="resize-none"
          mainInputContainerClass="h-40"
        />
        <TagInput
          label="Tags"
          description="Press Enter to add each tag. Add tags to help categorize the lore. These tags will also be considered as meta keywords."
          values={loreData?.tags || []}
          onChange={(tags) => onLoreDataChange({ ...loreData, tags })}
          tagContainerClass="h-40"
        />
      </div>
      <div className="flex flex-col">
        <div className={`text-sm font-semibold`}>Thumbnail</div>
        <div className="mt-1 mb-2 text-sm text-black/60">
          This thumbnail will be shown as a preview of the lore.
        </div>
        <div
          className="group relative flex aspect-video h-auto w-80 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-black/20 bg-black/10 text-sm text-black/50 xl:w-100"
          onClick={() => {
            imgInputRef.current?.click();
          }}
        >
          {loreData?.thumbnailUrl && (
            <div className="absolute top-0 right-0 z-10 flex h-full w-full gap-0 bg-linear-30 from-transparent to-white p-2 opacity-0 transition-all group-hover:opacity-100">
              <div className="mb-auto ml-auto cursor-pointer rounded-full p-2 hover:bg-black/10">
                <BiPencil size={20} />
              </div>
              <div
                className="mb-auto cursor-pointer rounded-full p-2 hover:bg-black/10"
                onClick={(e) => {
                  if (loreData?.thumbnailUrl) {
                    const a: HTMLAnchorElement = document.createElement("a");
                    a.href = loreData.thumbnailUrl;
                    a.target = "_blank";
                    a.download = "thumbnail.jpg";
                    a.click();
                    e.stopPropagation();
                  }
                }}
              >
                <FiDownload size={20} />
              </div>
              <div className="mb-auto cursor-pointer rounded-full p-2 hover:bg-black/10">
                <BiTrash size={20} />
              </div>
            </div>
          )}
          {loreData?.thumbnailUrl ? (
            <img
              src={loreData?.thumbnailUrl}
              alt="Demo"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            "Select thumbnail"
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imgInputRef}
            onChange={handleImageChange}
          />
        </div>
        <div className="mt-5">
          <div className={`text-sm font-semibold`}>Demo Lore View</div>
          <div className="mt-1 mb-2 text-sm text-black/60">
            This will be shown as a preview of the lore.
          </div>
          <Lore
            lore={{
              ...loreData,
              viewsCount: 0,
              likesCount: 0,
              dislikesCount: 0,
              _id: "demo-lore-id",
              next: [],
              createdBy: "user",
              createdById: "userid",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            className="border border-black/15"
            titleClassName="bg-white!"
            containerClassName="mb-12.5"
          />
        </div>
        <div className="mt-4">
          <button
            onClick={onSave}
            className="cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70"
          >
            {loreData?._id ? "Save" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoreForm;
