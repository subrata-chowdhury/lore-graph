"use client";
import { PageType } from "@/types/types";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GoTriangleDown } from "react-icons/go";

export default function Levels({ levels }: { levels: PageType["lvls"] }) {
  const [showLevels, setShowLevels] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const currentLevel = parseInt(new URL(window.location.href).searchParams.get("level") || "0");

  const handleLevelChange = (level: number) => {
    setShowLevels(false);
    router.push(`${pathname}?level=${level}`);
  };

  return (
    <>
      <div
        onClick={() => setShowLevels((val) => !val)}
        className="fixed top-3 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-lg bg-black/10 px-4 py-2 pr-2 text-sm font-medium text-black"
      >
        {levels[currentLevel].title}
        <div className="rounded-full p-1 transition-all hover:bg-black/15">
          <GoTriangleDown className={`transition-all ${showLevels ? "rotate-180" : ""}`} />
        </div>
      </div>
      {showLevels && (
        <div className="fixed top-14 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-3 rounded-lg bg-black/10 px-4 py-2 text-sm font-medium text-black">
          {levels.map((level, idx) => (
            <div
              key={level.id}
              onClick={() => handleLevelChange(idx)}
              className="hover:text-black/80"
            >
              {level.title}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
