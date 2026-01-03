"use client";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import ProfilePopup from "./ProfilePopup";

type Props = {};

const headings: { [key: string]: string } = {
  "/super-admin": "Super Admin Dashboard",
  "/users": "User Management",
  "/settings": "Settings",
};

const Topbar = (props: Props) => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-16 border-b border-black/20 w-full px-4 bg-white">
      <div className="flex items-center text-xl font-semibold">
        {headings[pathname] || "Super Admin"}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center text-sm font-bold">S</div>
        <div className="cursor-pointer relative" onClick={() => setShowProfilePopup(!showProfilePopup)}>
          <div className="text-sm font-medium">Super Admin</div>
          <div className="text-xs text-black/60">
            superadmin@example.com
          </div>
          {showProfilePopup && (
            <ProfilePopup
              onClose={() => setShowProfilePopup(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
