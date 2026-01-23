"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { IconBaseProps } from "react-icons";
import { usePathname } from "next/navigation";
import { IoIosArrowForward } from "react-icons/io";
import { HiOutlineRectangleGroup } from "react-icons/hi2";
import { FaHashnode } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { MdOutlineFeedback } from "react-icons/md";
import { useAppContext } from "@/contexts/AppContext";
import { FaRegBell } from "react-icons/fa";
import { useSidebar } from "../_contexts/SidebarContext";

const menus: {
  name: string;
  url: string;
  icon: React.FC<IconBaseProps>;
  matcher?: string[];
  protected?: boolean;
}[] = [
  {
    name: "Search",
    url: "/feed",
    matcher: ["/feed"],
    icon: IoSearch,
  },
  {
    name: "Notifications",
    url: "/notifications",
    matcher: ["/notifications"],
    icon: FaRegBell,
  },
  {
    name: "Pages",
    url: "/super-admin/pages",
    matcher: ["/super-admin/pages", "/super-admin/pages/new"],
    icon: HiOutlineRectangleGroup,
    protected: true,
  },
  {
    name: "Lores",
    url: "/super-admin/lores",
    matcher: ["/super-admin/lores", "/super-admin/lores/new"],
    icon: HiOutlineRectangleGroup,
    protected: true,
  },
];

const Sidebar = () => {
  const [minimal, setMinimal] = useState(true);
  const pathname = usePathname();
  const { user } = useAppContext();
  const { isOpen, setIsOpen } = useSidebar();

  useEffect(() => {
    setMinimal(window.innerWidth >= 768);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed ${isOpen ? "translate-x-0" : "-translate-x-full"} left-0 z-20 flex h-screen flex-col border-r border-black/20 bg-white px-3 pb-3 transition-transform duration-300 md:relative md:translate-x-0`}
      >
        <Link
          href={"/"}
          className="flex items-center justify-center gap-4 py-4 text-center text-lg font-bold"
        >
          <FaHashnode size={20} className="min-h-7" />
          {minimal ? "" : "Lore Graph"}
        </Link>
        <div
          onClick={() => setMinimal((prevVal) => !prevVal)}
          className="absolute top-16 right-0 hidden translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-black/20 bg-white p-1.5 md:block"
        >
          <IoIosArrowForward
            size={20}
            className={`transition-transform duration-300 ${minimal ? "" : "rotate-180"}`}
          />
        </div>
        <div className="mt-4 flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-auto">
          {menus.map((menu) => {
            if (!user && menu.protected) return null;
            const Icon = menu.icon;
            return (
              <Link
                key={menu.name}
                href={menu.url}
                onClick={() => setIsOpen(false)}
                className={`flex min-h-6 w-full ${minimal ? "px-3 py-2.5" : "min-w-45 px-4 py-2.5"} items-center gap-2 rounded-lg text-sm leading-tight transition-all duration-200 hover:bg-black/10 ${
                  menu.matcher
                    ? menu.matcher.some((path) => pathname.startsWith(path))
                      ? "bg-black/20 font-semibold"
                      : ""
                    : pathname === menu.url
                      ? "bg-black/20 font-semibold"
                      : ""
                }`}
              >
                <Icon size={20} />
                {minimal ? null : <div>{menu.name}</div>}
              </Link>
            );
          })}
        </div>
        <Link
          href="/settings"
          onClick={() => setIsOpen(false)}
          className={`mt-2 flex min-h-6 w-full ${minimal ? "px-3 py-2.5" : "min-w-45 px-4 py-2.5"} items-center gap-2 rounded-lg text-sm leading-tight transition-all duration-200 hover:bg-black/10 ${
            pathname === "/settings" ? "bg-black/20 font-semibold" : ""
          }`}
        >
          <IoSettingsOutline size={20} />
          {minimal ? null : <div>Settings</div>}
        </Link>
        <Link
          href="/login"
          onClick={() => setIsOpen(false)}
          className={`mt-2 flex min-h-6 w-full ${minimal ? "px-3 py-2.5" : "min-w-45 px-4 py-2.5"} items-center gap-2 rounded-lg text-sm leading-tight transition-all duration-200 hover:bg-black/10 ${
            pathname === "/login" ? "bg-black/20 font-semibold" : ""
          }`}
        >
          <MdOutlineFeedback size={20} />
          {minimal ? null : <div>Feedback</div>}
        </Link>
        <div className={`mt-1 text-center text-xs ${minimal ? "hidden" : ""} text-black/50`}>
          &copy; 2023 Lore Graph.
          <br />
          All rights reserved.
        </div>
      </div>
    </>
  );
};

export default Sidebar;
