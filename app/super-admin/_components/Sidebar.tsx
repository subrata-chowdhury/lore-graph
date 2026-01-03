"use client";
import Link from "next/link";
import React, { useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { IconBaseProps } from "react-icons";
import { usePathname } from "next/navigation";
import { IoIosArrowForward } from "react-icons/io";
import { HiOutlineRectangleGroup } from "react-icons/hi2";

const menus: { name: string; url: string; icon: React.FC<IconBaseProps>; matcher?: string[] }[] = [
  {
    name: "Dashboard",
    url: "/super-admin",
    icon: LuLayoutDashboard,
  },
  {
    name: "Pages",
    url: "/super-admin/pages",
    matcher: ["/super-admin/pages", "/super-admin/pages/new", "/super-admin/pages/edit"],
    icon: HiOutlineRectangleGroup,
  },
  {
    name: "Users",
    url: "/super-admin/users",
    icon: FiUsers,
  },
  {
    name: "Settings",
    url: "/super-admin/settings",
    icon: IoSettingsOutline,
  },
];

const Sidebar = () => {
  const [minimal, setMinimal] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative h-screen border-r border-black/20 px-4">
      <div className="py-6 text-center text-lg font-bold">{minimal ? "LG" : "Lore Graph"}</div>
      <div className="absolute top-16 right-0 translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-black/20 bg-white p-1.5">
        <IoIosArrowForward
          size={20}
          className={`transition-transform duration-300 ${minimal ? "" : "rotate-180"}`}
          onClick={() => setMinimal((prevVal) => !prevVal)}
        />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link
              key={menu.name}
              href={menu.url}
              className={`flex min-h-6 w-full ${minimal ? "" : "min-w-45"} items-center gap-2 rounded-lg ${minimal ? "px-3.5" : "px-4"} py-3 text-sm leading-tight transition-all duration-200 hover:bg-black/10 ${
                menu.matcher
                  ? menu.matcher.includes(pathname)
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
    </div>
  );
};

export default Sidebar;
