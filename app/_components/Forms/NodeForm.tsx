"use client";
import Node from "@/app/_components/Node";
import fetcher from "@/libs/fetcher";
import { NodeType } from "@/types/nodeTypes";
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
  nodeData: Omit<
    NodeType,
    "_id" | "createdAt" | "updatedAt" | "likesCount" | "viewsCount" | "createdBy" | "createdById"
  >;
  onNodeDataChange: (
    updatedNode: Omit<
      NodeType,
      "_id" | "createdAt" | "updatedAt" | "likesCount" | "viewsCount" | "createdBy" | "createdById"
    >
  ) => void;
  onSave?: () => void;
};

const NodeForm = ({ nodeData, onNodeDataChange = () => {}, onSave = () => {} }: Props) => {
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onNodeDataChange({ ...nodeData, thumbnailUrl: url });
    }
  }

  function fetchVideoDetails() {
    const youtubeId = getYouTubeID(nodeData?.src || "");
    if (youtubeId) {
      fetcher
        .get<{
          data: {
            title: string;
            description: string;
            thumbnails: string;
            tags: string[];
          };
        }>(`/super-admin/video-details?videoId=${youtubeId}`)
        .then((data) => {
          if (data.body?.data)
            onNodeDataChange({
              ...nodeData,
              title: data.body.data.title,
              description: data.body.data.description,
              thumbnailUrl: data.body.data.thumbnails,
              tags: data.body.data.tags || [],
            });
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error fetching video details");
        });
    }
  }

  return (
    <div className="flex flex-1 justify-between gap-8 bg-white p-6 px-8">
      <div>
        <div className="mb-4 flex gap-6">
          <div>
            <div className="mb-2 flex flex-col gap-1">
              <div className={`text-sm font-semibold`}>Type</div>
              <div className="text-sm text-black/60">Select the type of node.</div>
            </div>
            <Dropdown
              width={"200px"}
              value={nodeData?.type || "video"}
              options={[
                { label: "Video", value: "video" },
                { label: "YouTube", value: "youtube" },
                { label: "Post", value: "post" },
              ]}
              onChange={(option) =>
                onNodeDataChange({ ...nodeData, type: option.value as NodeType["type"] })
              }
              containerClassName="text-sm capitalize"
              mainContainerClassName="pl-3"
            />
          </div>
          <div>
            <div className="mb-2 flex flex-col gap-1">
              <div className={`text-sm font-semibold`}>Visibility</div>
              <div className="text-sm text-black/60">Select the visibility of the node.</div>
            </div>
            <Dropdown
              width={"200px"}
              value={nodeData?.visibility || "private"}
              options={[
                { label: "Public", value: "public" },
                { label: "Private", value: "private" },
              ]}
              onChange={(option) =>
                onNodeDataChange({
                  ...nodeData,
                  visibility: option.value as NodeType["visibility"],
                })
              }
              containerClassName="text-sm"
              mainContainerClassName="pl-3"
            />
          </div>
        </div>
        {nodeData?.type === "youtube" && (
          <div className="flex gap-3">
            <Input
              label="Source"
              description="Source URL for the youtube video."
              value={nodeData?.src || ""}
              onChange={(val) => onNodeDataChange({ ...nodeData, src: val })}
              placeholder="Enter youtube video link"
              max={150}
              containerClass="mb-4 flex-1"
              labelClass="text-sm font-semibold"
              inputClass="text-sm"
            />
            <button
              disabled={!nodeData?.src}
              className={`mt-auto mb-4 rounded-full bg-black/20 px-5 py-2 text-sm font-semibold hover:bg-black/25 ${
                !nodeData?.src ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              onClick={fetchVideoDetails}
            >
              Fetch Details
            </button>
          </div>
        )}
        <TextAreaInput
          label="Title (required)"
          description="This title will also consider as meta title."
          value={nodeData?.title || ""}
          onChange={(val) => onNodeDataChange({ ...nodeData, title: val })}
          placeholder="Enter node title"
          max={100}
          containerClass="mb-4"
          inputClass="resize-none"
        />
        <TextAreaInput
          label="Description (required)"
          description="This description will also consider as meta description."
          value={nodeData?.description || ""}
          onChange={(val) => onNodeDataChange({ ...nodeData, description: val })}
          placeholder="Enter node description"
          containerClass="mb-4"
          inputClass="resize-none"
          mainInputContainerClass="h-40"
        />
        <TagInput
          label="Tags"
          description="Press Enter to add each tag. Add tags to help categorize the node. These tags will also be considered as meta keywords."
          values={nodeData?.tags || []}
          onChange={(tags) => onNodeDataChange({ ...nodeData, tags })}
          tagContainerClass="h-40"
        />
      </div>
      <div className="flex flex-col">
        <div className={`text-sm font-semibold`}>Thumbnail</div>
        <div className="mt-1 mb-2 text-sm text-black/60">
          This thumbnail will be shown as a preview of the node.
        </div>
        <div
          className="group relative flex aspect-video h-auto w-100 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-black/20 bg-black/10 text-sm text-black/50"
          onClick={() => {
            imgInputRef.current?.click();
          }}
        >
          {nodeData?.thumbnailUrl && (
            <div className="absolute top-0 right-0 z-10 flex h-full w-full gap-0 bg-linear-30 from-transparent to-white p-2 opacity-0 transition-all group-hover:opacity-100">
              <div className="mb-auto ml-auto cursor-pointer rounded-full p-2 hover:bg-black/10">
                <BiPencil size={20} />
              </div>
              <div
                className="mb-auto cursor-pointer rounded-full p-2 hover:bg-black/10"
                onClick={(e) => {
                  if (nodeData?.thumbnailUrl) {
                    const a: HTMLAnchorElement = document.createElement("a");
                    a.href = nodeData.thumbnailUrl;
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
          {nodeData?.thumbnailUrl ? (
            <img
              src={nodeData?.thumbnailUrl}
              alt="Demo"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            "Select thumbnail"
          )}
          <input type="file" className="hidden" ref={imgInputRef} onChange={handleImageChange} />
        </div>
        <div className="mt-5">
          <div className={`text-sm font-semibold`}>Demo Node View</div>
          <div className="mt-1 mb-2 text-sm text-black/60">
            This will be shown as a preview of the node.
          </div>
          <Node
            node={{
              ...nodeData,
              viewsCount: 0,
              likesCount: 0,
              _id: "demo-node-id",
              next: [],
              createdBy: "user",
              createdById: "userid",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            className="w-100! border border-black/15"
          />
        </div>
        <div className="mt-4">
          <button
            onClick={onSave}
            className="cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeForm;
