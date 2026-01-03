"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { FiCheck, FiCopy } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  profileData?: {
    name: string;
    email: string;
    role: string;
    profileImageUrl?: string;
  };
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
      <div className="absolute top-14 right-0 z-20 min-h-82 w-[320px] rounded-2xl border border-black/10 shadow-lg bg-white">
        <div
          onClick={() => router.push("/" + pathname.split("/")[1] + "/profile")}
          className="mb-4 flex flex-col gap-2 px-4 text-center "
        >
          <div className="m-auto mt-8 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-sm font-bold">
            {profile?.profileImageUrl ? (
              <Image
                src={profile.profileImageUrl}
                alt="profile-image"
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
                width={40}
                height={40}
              />
            ) : (
              profile?.name.charAt(0).toUpperCase() || "N"
            )}
          </div>
          <div className="text-2xl font-semibold">{profile?.name || "N/A"}</div>
          <div>{profile?.email || "N/A"}</div>
          <div className="text-[#96989F]">{profile?.role.toUpperCase() || "N/A"}</div>
        </div>
        <div className="mt-1 flex flex-col px-4">
          <Link
            href={"/" + pathname.split("/")[1] + "/profile/edit/personal-settings"}
            className="flex h-16 cursor-pointer items-center gap-2 border-t border-black/10 p-2 hover:bg-black/5 rounded-lg"
          >
            <IoSettingsOutline size={20} />
            Settings
          </Link>
          <div
            className="flex h-16 cursor-pointer items-center gap-2 border-t border-black/10 p-2 hover:bg-black/5 rounded-lg "
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
