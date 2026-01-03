"use client";
import React, { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";

type Props = {
  label?: string;
  description?: string;
  values?: string[];
  className?: string;
  onChange?: (val: string[]) => void;
  error?: string;
  max?: number;
  tagContainerClass?: string;
};

const TagInput = ({
  label,
  description = "",
  values = [],
  onChange = () => {},
  className = "",
  error = "",
  max = 500,
  tagContainerClass = "",
}: Props) => {
  const [tag, setTag] = useState<string>("");
  const inputContainer = useRef<HTMLInputElement>(null);
  const valueLength = values.join("").length;

  return (
    <div
      className={"flex flex-col gap-1 rounded " + className}
      onClick={() => inputContainer.current?.focus()}
    >
      {label && <div className="text-sm font-semibold">{label}</div>}
      {description && <div className="text-sm text-black/60">{description}</div>}
      <div
        className={`max-h-44 min-h-20 ${tagContainerClass} flex flex-col gap-1 rounded-lg border ${valueLength > (max || Infinity) ? "border-red-500" : "border-black/15 focus-within:border-black/50"} px-2 py-1 dark:border-white/20`}
      >
        <div className="flex-1 overflow-y-auto">
          {values.length > 0 &&
            values.map((tag, index) => (
              <div
                key={index}
                className="m-0.5 inline-flex items-center justify-between rounded-md bg-black/10 px-2.5 py-1.25 text-sm dark:bg-white/25"
              >
                {tag}
                <CgClose
                  className="ml-1.5 cursor-pointer brightness-0 filter dark:invert"
                  onClick={() => {
                    const newTags = [...values];
                    newTags.splice(index, 1);
                    onChange(newTags);
                  }}
                  size={14}
                />
              </div>
            ))}
          <input
            ref={inputContainer}
            className="m-2 bg-transparent outline-none"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tag.trim() !== "") {
                const newTags = [...values, tag.trim()];
                setTag("");
                onChange(newTags);
              }
            }}
          />
        </div>
        <p
          className={`ms-auto mt-auto text-xs text-gray-500 ${valueLength > max ? "text-red-500" : ""}`}
        >
          {valueLength}/{max}
        </p>
      </div>
      {error.length > 0 ? <p className="text-xs font-medium text-red-500">{error}</p> : ""}
    </div>
  );
};

export default TagInput;
