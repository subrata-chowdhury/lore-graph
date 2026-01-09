import React, { useState } from "react";
import Pagination from "./Pagination";
import Image from "next/image";
import Dropdown from "./Dropdown";
import { BiSearch } from "react-icons/bi";

type Props<T> = {
  name?: string;
  table: {
    config: {
      heading: string;
      selector?: keyof T;
      hideAble?: boolean;
      component?: React.FC<{ data: T; index: number }>;
    }[];
    data: T[];
    tableStyle?: React.CSSProperties;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  limit: {
    options: { label: string; value: string | number }[];
    limit: string | number;
    onLimitChange: (value: string | number) => void;
  };
  onSearch?: (value: string) => void;
  tag?: {
    tags: string[];
    onTagChange: (tag: string) => void;
  };
  dropdown?: {
    options: { label: string; value: string | number }[];
    value: string | number;
    onChange: (value: string | number) => void;
    width?: number;
    height?: number;
    // showPopupAtTop?: boolean,
  };
  loading?: boolean;
};

function Table<T>({
  name,
  table,
  pagination,
  limit,
  onSearch,
  tag,
  dropdown,
  loading = false,
}: Props<T>) {
  return (
    <div className="flex h-full flex-1 flex-col rounded-md border border-black/15 bg-white dark:border-white/20 dark:bg-black">
      {name && (
        <h3 className="border-b-2 border-black/10 p-2 px-3 text-lg font-semibold dark:border-white/30">
          {name}
        </h3>
      )}
      <div className="flex flex-col items-center justify-between gap-2 p-2.5 px-3 md:flex-row">
        <TableTags loading={loading} tags={tag?.tags || []} onActiveTagChange={tag?.onTagChange} />
        <div className="flex items-center gap-2">
          {onSearch && <SearchBar onSearch={(val) => (!loading ? onSearch(val) : "")} />}
          {dropdown && (
            <Dropdown
              loading={loading}
              options={dropdown?.options || []}
              value={dropdown?.value || ""}
              onChange={(val) => dropdown?.onChange(val.value)}
              width={dropdown?.width}
              height={dropdown?.height}
            />
          )}
        </div>
      </div>
      <MainTable<T> loading={loading} {...table} />
      <div className="flex flex-col items-center justify-between gap-2 p-3 px-4 md:flex-row md:gap-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600 dark:text-white/65">Showing</p>
          <Dropdown
            loading={loading}
            options={
              limit.options || [
                { label: "5", value: 5 },
                { label: "10", value: 10 },
                { label: "20", value: 20 },
              ]
            }
            value={limit.limit}
            onChange={(val) => limit.onLimitChange(val.value)}
            showPopupAtTop={true}
            height={38}
          />
          <p className="text-sm text-nowrap text-gray-600 dark:text-white/65">
            Out of {pagination.totalPages}
          </p>
        </div>
        <Pagination
          loading={loading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onChange={pagination.onPageChange}
        />
      </div>
    </div>
  );
}

export default Table;

interface MainTableProps<T> {
  config: {
    heading: string;
    selector?: keyof T;
    hideAble?: boolean;
    component?: React.FC<{ data: T; index: number }>;
  }[];
  data: T[];
  className?: string;
  loading?: boolean;
}

export function MainTable<T>({
  config = [],
  data = [],
  className = "",
  loading = false,
}: MainTableProps<T>) {
  if (!config.length) return <div>Invalid Data</div>;
  return (
    <table
      className={
        "w-full flex-1 table-auto overflow-y-auto border-y border-black/10 text-start " + className
      }
      cellPadding={0}
      cellSpacing={0}
    >
      <thead>
        <tr className="h-11 bg-black/10 dark:bg-white/20">
          {config.map((configObj, index) => (
            <th
              key={index}
              className={`min-h-11 items-center pl-4 text-start font-normal ${configObj.hideAble ? "hidden md:flex" : ""}`}
            >
              {configObj.heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!loading &&
          data?.length > 0 &&
          data.map((obj, index) => (
            <tr key={index} className="h-12 border-t border-black/15 py-1.5 dark:border-white/30">
              {config.map((configObj, innerIndex) => (
                <td
                  key={innerIndex}
                  className={`min-h-12 items-center pl-4 ${configObj.hideAble ? "hidden md:table-cell" : ""}`}
                >
                  {configObj.component
                    ? React.createElement(configObj.component, { data: obj, index })
                    : obj[(configObj.selector || "") as keyof T]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        {loading && (
          <tr>
            <td className="h-12 text-center font-medium text-red-500" colSpan={config.length}>
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border border-gray-900 border-b-transparent dark:border-white/30 dark:border-b-transparent"></div>
              </div>
            </td>
          </tr>
        )}
        {!loading && (!data || data?.length <= 0) && (
          <tr className="h-full min-h-12">
            <td
              className="h-full min-h-12 text-center font-medium text-red-500"
              colSpan={config.length}
            >
              No Data Found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function TableTags({
  tags = [],
  onActiveTagChange = () => {},
  loading = false,
}: {
  tags: string[];
  onActiveTagChange?: (tag: string) => void;
  loading?: boolean;
}) {
  const [activeTag, setActiveTag] = useState(tags[0]);

  return (
    <div className="inline-flex gap-2">
      {tags.map((tag, index) => (
        <div
          key={index}
          className={`cursor-pointer rounded border p-1 px-3 text-sm font-semibold ${activeTag === tag ? "border-primary bg-primary/80 text-white dark:border-white/80 dark:bg-white/90 dark:text-black" : "bg-primary/15 border-gray-300/50 dark:border-white/5 dark:bg-white/25"}`}
          onClick={() => {
            if (loading) return;
            setActiveTag(tag);
            onActiveTagChange(tag);
          }}
        >
          {tag}
        </div>
      ))}
    </div>
  );
}

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
