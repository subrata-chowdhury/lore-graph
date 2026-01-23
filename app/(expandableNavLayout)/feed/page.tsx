"use client";

import React, { useEffect, useState } from "react";
import Topbar from "../_components/Topbar";
import fetcher from "@/libs/fetcher";
import { PageType } from "@/types/types";
import Link from "next/link";

type Props = {};

type PagesResponse = {
  pages: PageType[];
  pagination: {
    pages: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
};

const FeedPage = (props: Props) => {
  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      const { body, error } = await fetcher.get<PagesResponse>("/pages/popular");
      if (body) {
        setPages(body.pages);
      } else {
        console.error(error);
      }
      setLoading(false);
    };

    fetchPages();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h1 className="mb-4 text-xl font-bold">Popular Pages</h1>
      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pages.map((page) => (
            <Link
              key={page._id}
              href={`/${page.slug}`}
              className="flex flex-col gap-2 rounded-lg border border-black/10 bg-white p-4 transition-all hover:shadow-md"
            >
              {page.bgImgUrl && (
                <div
                  className="h-32 w-full rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${page.bgImgUrl})` }}
                />
              )}
              <h2 className="line-clamp-1 text-lg font-semibold">{page.title}</h2>
              <p className="line-clamp-2 text-sm text-gray-600">{page.description}</p>
              <div className="mt-auto flex flex-wrap gap-1">
                {page.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Likes: {page.likes}</span>
                <span>Views: {page.views}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && pages.length === 0 && (
        <div className="text-center text-gray-500">No pages found.</div>
      )}
    </div>
  );
};

export default FeedPage;
