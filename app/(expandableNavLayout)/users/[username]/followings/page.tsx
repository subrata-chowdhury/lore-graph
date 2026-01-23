"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import fetcher from "@/libs/fetcher";
import { BiSearch } from "react-icons/bi";
import Pagination from "@/ui/components/Pagination";
import { FaHashnode } from "react-icons/fa6";
import debounce from "@/libs/debouncer";
import { useParams } from "next/navigation";
import UserCard from "../_components/UserCard";

interface FollowingType {
  _id: string;
  followingName: string;
  followingUsername: string;
  createdAt: string;
}

const FollowingPage = () => {
  const { username } = useParams();
  const [data, setData] = useState<FollowingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchFollowings = useCallback(
    async ({ search }: { search: string }) => {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.set("page", currentPage.toString());
      queryParams.set("limit", "10");
      if (search) queryParams.set("search", search);

      const res = await fetcher.get<{
        followings: FollowingType[];
        pagination: { totalPages: number; currentPage: number; pageSize: number };
      }>(`/users/${username}/followings?${queryParams.toString()}`);

      if (res.status === 200 && res.body) {
        setData(res.body.followings);
        setTotalPages(res.body.pagination.totalPages || 1);
        setCurrentPage(res.body.pagination.currentPage);
      }
      setLoading(false);
    },
    [username, currentPage]
  );

  const debouncedSearch = useMemo(() => debounce(fetchFollowings, 500), []);

  useEffect(() => {
    fetchFollowings({ search: "" });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 p-4 sm:gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-xl font-bold sm:text-2xl">Following</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full rounded-full border border-black/10 bg-white py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-black/50 dark:border-white/10 dark:bg-black"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
                debouncedSearch({ search: e.target.value });
              }}
            />
            <BiSearch
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>
      </div>
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((user) => (
            <UserCard
              key={user._id}
              user={{
                _id: user._id,
                username: user.followingUsername,
                name: user.followingName,
              }}
            />
          ))}
        </div>
      )}
      {!loading && data.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-200 p-6 dark:bg-white/5">
            <FaHashnode size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">No users found</h2>
          <p className="text-gray-500">Try adjusting your search or check back later.</p>
        </div>
      )}
      {loading && (
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default FollowingPage;
