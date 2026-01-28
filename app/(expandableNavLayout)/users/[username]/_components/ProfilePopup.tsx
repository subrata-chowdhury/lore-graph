"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TbLogout } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { UserType } from "@/types/userTypes";
import ProfilePic from "./ProfilePic";
import { LuCircleHelp } from "react-icons/lu";
import { LuCircleUser } from "react-icons/lu";

type Props = {
  profileData?: UserType | null;
  onClose?: () => void;
};

const ProfilePopup = ({ profileData: profile, onClose = () => {} }: Props) => {
  const pathName = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.includes("session")) {
          document.cookie =
            cookie.split("=")[0] + "=;expires=" + new Date(0).toUTCString() + ";path=/";
        }
      }
      router.replace("/login?redirect=" + pathName);
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
      <div className="absolute top-14 right-0 z-20 w-70 rounded-2xl border border-black/10 bg-white p-4 pb-2 shadow-lg">
        <div className="mb-4 flex flex-col gap-1 text-center">
          <div className="relative mx-auto mt-3 h-10 w-10 overflow-hidden rounded-full bg-white dark:border-gray-900 dark:bg-gray-800">
            <ProfilePic
              imageUrl={profile?.profileImage}
              userName={profile?.name}
              className="text-sm!"
            />
          </div>
          <div className="text-xl font-semibold">{profile?.name || "N/A"}</div>
          <div className="text-sm">{profile?.email || "N/A"}</div>
        </div>
        <div className="mt-1 flex flex-col">
          <Link
            href={"/@" + profile?.username}
            className="flex h-12 cursor-pointer items-center gap-2 rounded-lg border-t border-black/10 p-2 hover:bg-black/5"
          >
            <LuCircleUser size={20} />
            Your Profile
          </Link>
          <Link
            href={"/personal-settings"}
            className="flex h-12 cursor-pointer items-center gap-2 rounded-lg border-t border-black/10 p-2 hover:bg-black/5"
          >
            <IoSettingsOutline size={20} />
            Settings
          </Link>
          <Link
            href={"/help"}
            className="flex h-12 cursor-pointer items-center gap-2 rounded-lg border-t border-black/10 p-2 hover:bg-black/5"
          >
            <LuCircleHelp size={20} />
            Help
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
