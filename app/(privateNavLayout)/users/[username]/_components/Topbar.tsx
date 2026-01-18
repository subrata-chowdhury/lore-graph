"use client";
import React, { useMemo, useState } from "react";
import ProfilePopup from "./ProfilePopup";
import { useAppContext } from "@/contexts/AppContext";
import { getInitials } from "@/utils/getInitials";
import { IoSearch } from "react-icons/io5";
import debounce from "@/libs/debouncer";
import { FaHashnode } from "react-icons/fa6";
import Link from "next/link";

type Props = {};

const Topbar = (props: Props) => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const { user } = useAppContext();

  const handleSearch = (value: string) => {
    console.log(value);
  };

  const debouncedSearch = useMemo(() => debounce(handleSearch, 500), []);

  return (
    <div className="flex h-16 w-full items-center gap-2 border-b border-black/20 bg-white px-4">
      <div className="ml-2 flex h-10 w-80 items-center rounded-full border border-black/20 bg-white px-4 text-sm outline-none focus:outline-none">
        <input
          type="text"
          placeholder="type @ to search users"
          className="h-full w-full bg-transparent pr-2 focus:outline-none"
          onChange={(e) => debouncedSearch(e.target.value)}
        />
        <IoSearch size={20} className="cursor-pointer text-gray-400" />
      </div>
      <div className="relative ml-auto">
        {user ? (
          <div
            onClick={() => setShowProfilePopup(!showProfilePopup)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/10 text-sm font-bold"
          >
            {getInitials(user?.name || "")}
          </div>
        ) : (
          <Link
            href={"/sign-up"}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-black/10 px-3 py-2 text-xs font-semibold"
          >
            <FaHashnode size={18} />
            Sign Up
          </Link>
        )}
        {showProfilePopup && (
          <ProfilePopup profileData={user} onClose={() => setShowProfilePopup(false)} />
        )}
      </div>
    </div>
  );
};

export default Topbar;
