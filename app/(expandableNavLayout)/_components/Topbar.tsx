"use client";
import React, { useMemo, useState } from "react";
import ProfilePopup from "../users/[username]/_components/ProfilePopup";
import { useAppContext } from "@/contexts/AppContext";
import { getInitials } from "@/utils/getInitials";
import { IoSearch } from "react-icons/io5";
import debounce from "@/libs/debouncer";
import { FaHashnode } from "react-icons/fa6";
import { FaRegBell } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiMenuAlt2 } from "react-icons/hi";
import { useSidebar } from "../_contexts/SidebarContext";

const Topbar = () => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const pathName = usePathname();
  const { user } = useAppContext();
  const { toggleSidebar } = useSidebar();

  const handleSearch = (value: string) => {
    console.log(value);
  };

  const debouncedSearch = useMemo(() => debounce(handleSearch, 500), []);

  return (
    <div className="flex h-16 w-full items-center gap-2 border-b border-black/20 bg-white px-4 py-2">
      <div className="cursor-pointer md:hidden" onClick={toggleSidebar}>
        <HiMenuAlt2 size={24} />
      </div>
      <div className="group/search ml-2 flex h-10 w-80 items-center rounded-full border border-black/20 bg-white px-4 text-sm outline-none focus-within:border-black/70 focus:outline-none">
        <input
          type="text"
          placeholder="type @ to search users"
          className="h-full w-full bg-transparent pr-2 focus:outline-none"
          onChange={(e) => debouncedSearch(e.target.value)}
        />
        <IoSearch
          size={20}
          className="cursor-pointer text-gray-400 group-focus-within/search:text-black/70"
        />
      </div>
      <div className="relative ml-auto flex gap-3">
        <div className="my-auto hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-black/50 md:flex">
          <FaRegBell size={18} />
        </div>
        {user ? (
          <div
            onClick={() => setShowProfilePopup(!showProfilePopup)}
            className="flex h-10 cursor-pointer gap-2 rounded-full bg-black/10 px-1 font-semibold md:pr-4"
          >
            <div className="my-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-xs font-bold">
              {getInitials(user?.name || "")}
            </div>
            <div className="my-auto hidden text-sm md:flex">@{user?.name}</div>
          </div>
        ) : (
          <Link
            href={"/sign-up?redirect=" + encodeURIComponent(pathName || "/")}
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
