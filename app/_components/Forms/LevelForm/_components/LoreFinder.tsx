"use client";
import debounce from "@/libs/debouncer";
import fetcher from "@/libs/fetcher";
import { LoreType } from "@/types/loreTypes";
import Dropdown from "@/ui/components/Dropdown";
import Modal from "@/ui/components/Modal";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight, BiSearch } from "react-icons/bi";
import { CgClose } from "react-icons/cg";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (lore: LoreType) => void;
};

const LoreFinder = ({ isOpen, onClose, onSelect }: Props) => {
  const [lores, setLores] = useState<LoreType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
  });
  const [sortingData, setSortingData] = useState({
    sort: "createdAt",
    order: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 1,
    total: 0,
  });

  const fetchLores = useCallback(
    debounce(async ({ filters, sortingData, pagination }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", pagination.page.toString());
        params.set("limit", pagination.limit.toString());
        if (filters.search) params.set("search", filters.search);
        if (filters.type) params.set("type", filters.type);
        params.set("sort", sortingData.sort);
        params.set("order", sortingData.order);

        const res = await fetcher.get<{
          success: boolean;
          data: LoreType[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>(`/lores?${params.toString()}`);
        if (res.body?.success) {
          setLores(res.body.data);
          setPagination((prev) => ({
            ...prev,
            totalPages: res.body?.pagination.totalPages || 0,
            total: res.body?.pagination.total || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching lores:", error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchLores({ filters, sortingData, pagination: { ...pagination, page: 1 } });
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw]"
    >
      <div className="flex items-center justify-between border-b border-black/20 p-4 px-5">
        <span className="font-semibold">Select a Lore</span>
        <button onClick={onClose} className="cursor-pointer text-sm text-gray-500 hover:text-black">
          <CgClose size={20} />
        </button>
      </div>
      <div className="flex flex-col gap-4 px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            onSearch={(value) => {
              setFilters((prev) => ({ ...prev, search: value }));
              fetchLores({
                filters: { ...filters, search: value },
                sortingData,
                pagination: { ...pagination, page: 1 },
              });
            }}
          />
          <Dropdown
            options={[
              { label: "All Types", value: "" },
              { label: "Video", value: "video" },
              { label: "YouTube", value: "youtube" },
              { label: "Post", value: "post" },
            ]}
            value={filters.type}
            onChange={(opt) => {
              setFilters((prev) => ({ ...prev, type: opt.value as string }));
              fetchLores({
                filters: { ...filters, type: opt.value as string },
                sortingData,
                pagination: { ...pagination, page: 1 },
              });
            }}
            width={130}
            containerClassName="text-sm"
          />
          <Dropdown
            options={[
              { label: "Newest", value: "createdAt-desc" },
              { label: "Oldest", value: "createdAt-asc" },
              { label: "A-Z", value: "title-asc" },
              { label: "Z-A", value: "title-desc" },
            ]}
            value={`${sortingData.sort}-${sortingData.order}`}
            onChange={(opt) => {
              const [s, o] = (opt.value as string).split("-");
              setSortingData((prev) => ({
                ...prev,
                sort: s,
                order: o,
              }));
              fetchLores({
                filters,
                sortingData: { sort: s, order: o },
                pagination: { ...pagination, page: 1 },
              });
            }}
            width={130}
            containerClassName="text-sm"
          />
          <Link
            href="/super-admin/lores/create"
            target="_blank"
            className="ml-auto cursor-pointer rounded-full bg-black/80 px-4 py-1.5 text-sm font-semibold text-white hover:bg-black/70"
          >
            Create
          </Link>
        </div>

        <div className="min-h-75">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>
          ) : lores.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              No lores found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {lores.map((lore) => (
                <div
                  key={lore._id}
                  onClick={() => onSelect && onSelect(lore)}
                  className="group relative cursor-pointer overflow-hidden rounded border border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
                >
                  <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800">
                    {lore.thumbnailUrl ? (
                      <img
                        src={lore.thumbnailUrl}
                        alt={lore.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="truncate text-sm font-medium">{lore.title}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{lore.type}</span>
                      <span>{new Date(lore.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 py-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => {
              fetchLores({
                filters,
                sortingData,
                pagination: { ...pagination, page: Math.max(1, pagination.page - 1) },
              });
            }}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
          >
            <BiChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => {
              fetchLores({
                filters,
                sortingData,
                pagination: {
                  ...pagination,
                  page: Math.min(pagination.totalPages, pagination.page + 1),
                },
              });
            }}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
          >
            <BiChevronRight size={20} />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoreFinder;

function SearchBar({ onSearch = () => {} }: { onSearch?: (value: string) => void }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex min-h-9 max-w-52 items-center gap-1 rounded border border-black/15 p-1 px-2 dark:border-white/30">
      <BiSearch size={20} className="my-auto" />
      <input
        className="w-full bg-transparent text-sm outline-none"
        value={searchValue}
        placeholder="Search"
        onChange={(e) => {
          setSearchValue(e.target.value);
          onSearch(e.target.value);
        }}
      />
    </div>
  );
}
