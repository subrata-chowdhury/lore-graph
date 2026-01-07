import { PageType } from "@/types/types";
import Input from "@/ui/components/Inputs/Input";
import TagInput from "@/ui/components/Inputs/TagInput";
import TextAreaInput from "@/ui/components/Inputs/TextAreaInput";
import React, { useRef, useState } from "react";
import { BiPencil, BiTrash } from "react-icons/bi";

type Props = {
  pageData: Omit<
    PageType,
    "_id" | "createdAt" | "updatedAt" | "authorId" | "rating" | "views" | "rated" | "likes"
  >;
  onPageDataChange: (
    updatedPage: Omit<
      PageType,
      "_id" | "createdAt" | "updatedAt" | "authorId" | "rating" | "views" | "rated" | "likes"
    >
  ) => void;
  onSave?: () => void;
};

const PageForm = ({ pageData, onPageDataChange, onSave = () => {} }: Props) => {
  const [demoImageUrl, setDemoImageUrl] = useState("");
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDemoImageUrl(url);
      onPageDataChange({ ...pageData, bgImgUrl: url });
    }
  }

  return (
    <div className="flex flex-1 justify-between gap-8 bg-white p-6 px-8">
      <div>
        <TextAreaInput
          label="Title (required)"
          description="This title will also consider as meta title."
          value={pageData?.title || ""}
          onChange={(val) => onPageDataChange({ ...pageData, title: val })}
          placeholder="Enter page title"
          max={100}
          containerClass="mb-4"
          inputClass="resize-none"
        />
        <TextAreaInput
          label="Description (required)"
          description="This description will also consider as meta description."
          value={pageData?.description || ""}
          onChange={(val) => onPageDataChange({ ...pageData, description: val })}
          placeholder="Enter page description"
          containerClass="mb-4"
          inputClass="resize-none"
          mainInputContainerClass="h-40"
        />
        <div>
          <Input
            label="Slug (required)"
            description="The slug is the part of a URL which identifies a page on a website in an easy-to-read form."
            value={pageData?.slug || ""}
            onChange={(val) =>
              onPageDataChange({ ...pageData, slug: val?.toLowerCase().replace(/\s+/g, "-") })
            }
            placeholder="Enter page slug"
            max={50}
            containerClass="mb-4"
            labelClass="text-sm font-semibold"
            inputClass="text-sm"
          />
        </div>
        <TagInput
          label="Tags"
          description="Press Enter to add each tag. Add tags to help categorize the page. These tags will also be considered as meta keywords."
          values={pageData?.tags || []}
          onChange={(tags) => onPageDataChange({ ...pageData, tags })}
          tagContainerClass="h-40"
        />
      </div>
      <div className="flex flex-col">
        <div
          className="group relative flex aspect-video h-auto w-75 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-black/20 bg-black/10 text-sm text-black/50 xl:w-100"
          onClick={() => {
            imgInputRef.current?.click();
          }}
        >
          {pageData?.bgImgUrl && (
            <div className="absolute top-0 right-0 flex h-full w-full gap-0 bg-linear-30 from-transparent to-white p-2 opacity-0 transition-all group-hover:opacity-100">
              <div className="mb-auto ml-auto cursor-pointer rounded-full p-2 hover:bg-black/10">
                <BiPencil size={20} />
              </div>
              <div className="mb-auto cursor-pointer rounded-full p-2 hover:bg-black/10">
                <BiTrash size={20} />
              </div>
            </div>
          )}
          {demoImageUrl ? (
            <img
              src={demoImageUrl}
              alt="Demo"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            "Select Background Image"
          )}
          <input type="file" className="hidden" ref={imgInputRef} onChange={handleImageChange} />
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

export default PageForm;
