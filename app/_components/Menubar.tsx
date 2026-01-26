"use client";
import { useAppContext } from "@/contexts/AppContext";
import { getInitials } from "@/utils/getInitials";
import Link from "next/link";
import { FaHashnode } from "react-icons/fa6";
import { MdOutlineFeedback } from "react-icons/md";
import { IoSearch, IoSettingsOutline } from "react-icons/io5";
import { usePathname } from "next/navigation";

const Menubar = () => {
  const { user } = useAppContext();
  const pathname = usePathname();

  return (
    <div className="z-10 flex h-screen max-h-dvh flex-col justify-between gap-2 border-r border-black/20 bg-black/0 p-3 py-4 pb-2 backdrop-blur-xl">
      <Link
        href={"/"}
        className="flex items-center justify-center gap-4 text-center text-lg font-bold"
      >
        <FaHashnode size={20} />
      </Link>
      <div className="mt-5 flex flex-col justify-center gap-2">
        <Link
          href={"/feed"}
          title="feed"
          className={`rounded-md px-2.5 py-2 hover:bg-black/10 ${pathname === "/feed" ? "bg-black/20 font-semibold" : ""}`}
        >
          <IoSearch size={20} />
        </Link>
        <Link
          href="/settings"
          title="Settings"
          className={`mt-auto flex min-h-6 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm leading-tight transition-all duration-200 hover:bg-black/10 ${
            pathname === "/settings" ? "bg-black/20 font-semibold" : ""
          }`}
        >
          <IoSettingsOutline size={20} />
        </Link>
      </div>
      {user ? (
        <Link
          href={"/@" + user?.username}
          className="mt-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-sm font-semibold"
        >
          {getInitials(user?.name || "")}
        </Link>
      ) : (
        <Link
          href={"/login"}
          className="mt-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/20"
        >
          <FaHashnode size={18} className="text-gray-600" />
        </Link>
      )}
      <Link href={"/feedback"} className="rounded-md px-2.5 py-2 hover:bg-black/10">
        <MdOutlineFeedback size={20} />
      </Link>
    </div>
  );
};

export default Menubar;
