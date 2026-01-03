"use client";
import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";

export default function DropdownWithPaginatedSearch<T extends { [key: string]: any }>({
  options = [],
  option,
  labelSelector,
  onOptionSelect,
  onSearch,
  onLoadMore,
  placeholder,
  pagination,
  loading = false,
}: {
  options: T[];
  option: T | null;
  labelSelector: keyof T;
  onOptionSelect: (option: T) => void;
  onSearch: (search: string) => void;
  onLoadMore: ({ search }: { search: string }) => void;
  placeholder: string;
  pagination: { page: number; total: number; total_pages: number };
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const lastElemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore({ search });
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      }
    );
    if (lastElemRef.current) {
      observer.observe(lastElemRef.current);
    }
    return () => {
      if (lastElemRef.current) {
        observer.unobserve(lastElemRef.current);
      }
    };
  }, [onLoadMore, lastElemRef, search]);

  useEffect(() => {
    setSearch(option ? option[labelSelector] : "");
  }, [option, labelSelector]);

  return (
    <div className="relative">
      <div className="flex rounded-md bg-[#0A0C12] p-2 px-3 text-gray-200">
        <input
          type="text"
          value={search}
          placeholder={placeholder}
          className="flex-1 outline-0"
          onChange={(e) => {
            setSearch(e.target.value);
            onSearch(e.target.value);
          }}
          onFocus={() => {
            setShowOptions(true);
          }}
        />
        <div
          className={`my-auto flex h-full cursor-pointer items-center justify-center transition-all ${showOptions ? "-rotate-90" : "rotate-90"}`}
          onClick={() => setShowOptions(true)}
        >
          <IoIosArrowForward />
        </div>
      </div>
      {showOptions && (
        <div
          className="fixed top-0 left-0 h-screen w-screen"
          onClick={() => setShowOptions(false)}
        ></div>
      )}
      {showOptions && (
        <div className="absolute top-10 z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-md bg-[#0A0C12] shadow-lg">
          {options.map((opt, idx) => (
            <div
              className="cursor-pointer px-4 py-2 hover:bg-[#151A26]"
              onClick={() => {
                onOptionSelect(opt);
                setShowOptions(false);
              }}
              key={idx}
            >
              {opt[labelSelector]}
            </div>
          ))}
          {pagination.page < pagination.total_pages && (
            <div
              ref={lastElemRef}
              className={
                "flex h-10 w-full cursor-pointer items-center justify-center text-xs font-semibold text-white" +
                (loading ? " opacity-50" : " opacity-80 hover:opacity-100")
              }
              onClick={() => {
                if (!loading && pagination.page < pagination.total_pages) {
                  onLoadMore({ search });
                }
              }}
            >
              {loading && <p>Loading...</p>}
              {!loading && pagination.page < pagination.total_pages && <p>Load more</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
