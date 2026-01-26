"use client";
import debounce from "@/libs/debouncer";
import fetcher from "@/libs/fetcher";
import { PageType } from "@/types/types";
import Dropdown from "@/ui/components/Dropdown";
import Input from "@/ui/components/Inputs/Input";
import Pagination from "@/ui/components/Pagination";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { BiPlus, BiSortAlt2, BiSortDown, BiSortUp, BiTrash, BiFile } from "react-icons/bi";
import { LuPencil } from "react-icons/lu";

const Pages = () => {
  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    visibility: "",
  });

  const [sorting, setSorting] = useState({
    sort: "createdAt",
    order: "desc" as "asc" | "desc",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchPages = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", pagination.page.toString());
    params.set("limit", pagination.limit.toString());
    params.set("sort", sorting.sort);
    params.set("order", sorting.order);
    if (filters.search) params.set("search", filters.search);
    if (filters.visibility) params.set("visibility", filters.visibility);

    const res = await fetcher.get<{
      data: PageType[];
      success: boolean;
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/pages/owned?${params.toString()}`);

    if (res.body?.success) {
      setPages(res.body.data);
      setPagination((prev) => ({
        ...prev,
        total: res.body?.pagination.total || 0,
        totalPages: res.body?.pagination.totalPages || 1,
      }));
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, sorting, filters]);

  const debouncedSearch = useCallback(
    debounce((val: string) => {
      setFilters((prev) => ({ ...prev, search: val }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500),
    []
  );

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    debouncedSearch(val);
  };

  const handleSort = (field: string) => {
    setSorting((prev) => ({
      sort: field,
      order: prev.sort === field && prev.order === "desc" ? "asc" : "desc",
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const renderSortIcon = (field: keyof PageType) => {
    if (sorting.sort !== field) return <BiSortAlt2 className="ml-1 inline opacity-40" />;
    return sorting.order === "asc" ? (
      <BiSortUp className="ml-1 inline" />
    ) : (
      <BiSortDown className="ml-1 inline" />
    );
  };

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return (
    <div className="m-4 mx-5 flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link
          href="/pages/create"
          className="flex cursor-pointer items-center rounded-full bg-black px-4.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/80"
        >
          <BiPlus className="mr-1" size={20} />
          Create Page
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="w-full max-w-xs">
          <Input
            label="Search"
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={handleSearchChange}
            labelClass="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            inputClass="text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Visibility
          </span>
          <Dropdown
            options={[
              { label: "All", value: "" },
              { label: "Public", value: "public" },
              { label: "Private", value: "private" },
            ]}
            value={filters.visibility}
            onChange={(opt) => {
              setFilters((prev) => ({ ...prev, visibility: opt.value.toString() }));
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            width={120}
            containerClassName="text-sm"
            mainContainerClassName="text-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 tracking-wider text-gray-600 uppercase">
              <tr>
                <th
                  className="cursor-pointer px-6 py-3 font-semibold transition-colors hover:bg-gray-100"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center justify-start">
                    Title {renderSortIcon("title")}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-semibold transition-colors hover:bg-gray-100"
                  onClick={() => handleSort("slug")}
                >
                  <div className="flex items-center justify-start">
                    Slug {renderSortIcon("slug")}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-semibold transition-colors hover:bg-gray-100"
                  onClick={() => handleSort("visibility")}
                >
                  <div className="flex items-center justify-start">
                    Visibility {renderSortIcon("visibility")}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-semibold transition-colors hover:bg-gray-100"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center justify-start">
                    Created {renderSortIcon("createdAt")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Loading pages...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <BiFile size={32} className="text-gray-300" />
                      <p className="font-medium">No pages found</p>
                      <p className="text-xs">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page._id} className="group transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span
                        className="max-w-50 truncate font-medium text-gray-900"
                        title={page.title}
                      >
                        {page.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500">{page.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          page.visibility === "public"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {page.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(page.createdAt).toDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/pages/${page._id}`}
                          className="flex items-center justify-start font-medium text-blue-600 transition-colors hover:text-blue-800"
                        >
                          <LuPencil />
                        </Link>
                        <button className="text-red-500">
                          <BiTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-semibold text-gray-700">{pagination.total}</span> results
            </div>
            <Dropdown
              options={[
                { label: "10", value: 10 },
                { label: "25", value: 25 },
                { label: "50", value: 50 },
                { label: "100", value: 100 },
              ]}
              value={pagination.limit}
              onChange={(opt) => {
                setPagination((prev) => ({ ...prev, limit: opt.value as number, page: 1 }));
              }}
              showPopupAtTop={true}
              containerClassName="text-xs mr-auto ml-3"
              mainContainerClassName="text-xs"
            />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onChange={(page) => {
                setPagination((prev) => ({ ...prev, page }));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pages;
