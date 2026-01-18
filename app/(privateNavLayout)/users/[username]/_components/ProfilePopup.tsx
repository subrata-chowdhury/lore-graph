"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { useAppContext } from "@/contexts/AppContext";
import { UserType } from "@/types/userTypes";
import ProfilePic from "./ProfilePic";
import User from "@/models/User";

type Props = {
  profileData?: UserType | null;
  onClose?: () => void;
};

const ProfilePopup = ({ profileData: profile, onClose = () => {} }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      router.replace("/auth/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 z-10 h-screen w-screen cursor-auto"
        onClick={onClose}
      ></div>
      <div className="absolute top-14 right-0 z-20 w-[320px] rounded-2xl border border-black/10 bg-white p-4 shadow-lg">
        <div
          onClick={() => router.push("/" + pathname.split("/")[1] + "/profile")}
          className="mb-4 flex flex-col gap-1 text-center"
        >
          <div className="relative mx-auto mt-3 h-10 w-10 overflow-hidden rounded-full bg-white dark:border-gray-900 dark:bg-gray-800">
            <ProfilePic userId={profile?._id} userName={profile?.name} className="text-lg!" />
          </div>
          <div className="text-xl font-semibold">{profile?.name || "N/A"}</div>
          <div className="text-sm">{profile?.email || "N/A"}</div>
          {/* <div className="text-xs text-[#96989F]">{profile?.role.toUpperCase() || "N/A"}</div> */}
        </div>
        <div className="mt-1 flex flex-col">
          <Link
            href={"/" + pathname.split("/")[1] + "/profile/edit/personal-settings"}
            className="flex h-12 cursor-pointer items-center gap-2 rounded-lg border-t border-black/10 p-2 hover:bg-black/5"
          >
            <IoSettingsOutline size={20} />
            Settings
          </Link>
          <div
            className="flex h-12 cursor-pointer items-center gap-2 rounded-lg border-t border-black/10 p-2 hover:bg-black/5"
            onClick={handleLogout}
          >
            <TbLogout size={20} />
            Log out
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePopup;
