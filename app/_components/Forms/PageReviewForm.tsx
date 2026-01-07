import { PageType } from "@/types/types";
import Dropdown from "@/ui/components/Dropdown";
import React from "react";

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
  onBack?: () => void;
  onSave?: () => void;
  isSubmitting?: boolean;
};

const PageReviewForm = ({
  pageData,
  onPageDataChange,
  onBack = () => {},
  onSave = () => {},
  isSubmitting = false,
}: Props) => {
  return (
    <div className="flex flex-1 justify-between gap-8 bg-white p-6 px-8">
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <div className="text-sm font-semibold text-black/60">Title</div>
          <h3 className="text-xl font-semibold">{pageData.title || "Untitled Page"}</h3>
        </div>

        <div>
          <div className="text-sm font-semibold text-black/60">Description</div>
          <p className="mt-1 text-sm text-black/80">
            {pageData.description || "No description provided."}
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-black/60">Slug</div>
          <p className="mt-1 text-sm text-black/80">{pageData.slug || "-"}</p>
        </div>

        <div>
          <div className="text-sm font-semibold text-black/60">Tags</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {pageData.tags && pageData.tags.length > 0 ? (
              pageData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-md bg-black/5 px-2 py-1 text-xs font-medium text-black/60"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-black/40">No tags added</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-black/60">
            Levels ({pageData.lvls?.length || 0})
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {pageData.lvls && pageData.lvls.length > 0 ? (
              pageData.lvls.map((lvl: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md border border-black/5 bg-black/5 px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-black/50">#{index + 1}</span>
                  <span className="font-medium">{lvl.title || lvl.name || "Untitled Level"}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-black/40">No levels added</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-80 flex-col gap-6 border-l border-black/10 pl-8">
        <div>
          <div className="mb-2 text-sm font-semibold">Background Preview</div>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-black/10 bg-black/10">
            {pageData.bgImgUrl ? (
              <img
                src={pageData.bgImgUrl}
                alt="Background"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-black/50">
                No Image
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-col gap-1">
            <div className={`text-sm font-semibold`}>Visibility</div>
            <div className="text-sm text-black/60">Who can see this page?</div>
          </div>
          <Dropdown
            width="100%"
            value={(pageData as any).visibility || "public"}
            options={[
              { label: "Public", value: "public" },
              { label: "Private", value: "private" },
            ]}
            onChange={(opt) => onPageDataChange({ ...pageData, visibility: opt.value } as any)}
            containerClassName="text-sm"
          />
        </div>

        <div className="mt-auto flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 cursor-pointer rounded-full bg-black/10 px-5 py-2 text-sm font-semibold text-black hover:bg-black/20"
          >
            Back
          </button>
          <button
            onClick={onSave}
            disabled={isSubmitting}
            className={`flex-1 cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70 ${
              isSubmitting ? "opacity-50" : ""
            }`}
          >
            {isSubmitting ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageReviewForm;
