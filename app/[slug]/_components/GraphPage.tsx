"use client";
import Image from "next/image";
import nbg from "@/assets/night.webp";
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { LoreType } from "@/types/loreTypes";
import Menubar from "@/app/_components/Menubar";
// import { conData, lvlData, nData } from "@/data/loreData";
import calculateEdges from "@/libs/edgeCalculationLogic";
import LoreModal from "@/app/_components/LoreModal/LoreModal";
import PinchZoomWrapper from "@/app/_components/PinchZoomFeature";
import Edge from "@/app/_components/Edge";
import Lore from "@/app/_components/Lore";
import { PageType } from "@/types/types";
import { usePathname, useRouter } from "next/navigation";
import { GoTriangleDown } from "react-icons/go";

export default function GraphPage({
  pageData,
  lvlData,
  nData,
}: {
  pageData: PageType;
  lvlData: { _id: string; next: string[] }[][];
  nData: LoreType[];
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {/* <Image
        src={nbg}
        alt="Night Background"
        width={540}
        height={268}
        className="fixed top-0 left-0 -z-20 min-h-screen w-full"
      /> */}
      <div className="fixed top-0 left-0 -z-10 min-h-screen w-full bg-black/70"></div>
      <div className="flex h-screen w-screen">
        <Menubar />
        <GraphView lvlData={lvlData} nData={nData} pageData={pageData} />
      </div>
    </div>
  );
}

export function GraphView({
  pageData,
  lvlData,
  nData,
}: {
  pageData: PageType;
  lvlData: { _id: string; next: string[] }[][];
  nData: LoreType[];
}) {
  const [loreContainerSize, setLoreContainerSize] = useState({
    width: 0,
    height: 0,
  });
  const [edges, setEdges] = useState<
    {
      from: { x: number; y: number };
      to: { x: number; y: number };
      paddingLeft?: number;
    }[]
  >([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const lores: Map<string, LoreType> = new Map(nData.map((item) => [item._id, item]));
  const levels: { _id: string; next: string[] }[][] = lvlData || [];

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      // 1. Prevent the default browser menu
      // event.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useLayoutEffect(() => {
    console.log("calculation started", new Date().getTime());
    const calculateEdgesAndUpdate = () => {
      if (levels.length > 0) {
        const result = calculateEdges({
          lores: levels.flat(),
          levels,
          containerRef,
          htmlLoresRef: refs,
        });
        if (!result) return;
        setEdges(result);
        refs.current[Object.keys(refs.current)[0]]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      console.log("calculation finished", new Date().getTime());
    };
    calculateEdgesAndUpdate();

    const getMainContainerWidth = () => {
      setLoreContainerSize({
        width: containerRef.current?.scrollWidth || 0,
        height: containerRef.current?.scrollHeight || 0,
      });
    };
    getMainContainerWidth();

    window.addEventListener("resize", calculateEdgesAndUpdate);

    return () => {
      window.removeEventListener("resize", calculateEdgesAndUpdate);
    };
  }, [levels]);

  console.log("rerender graph view");

  return (
    <>
      <LoreModal />
      <Levels levels={pageData.lvls} />
      <PinchZoomWrapper>
        <div
          ref={containerRef}
          className="relative grid h-full min-h-125 grid-flow-col gap-35 px-20"
        >
          {/* Edges SVGs */}
          <svg
            className="pointer-events-none absolute top-0 left-0"
            width={loreContainerSize.width}
            height={loreContainerSize.height}
          >
            {edges.map((edge) => (
              <Edge
                key={`${edge.from.x}-${edge.from.y}-${edge.to.x}-${edge.to.y}`}
                from={edge.from}
                to={edge.to}
                paddingLeft={edge.paddingLeft || 0}
              />
            ))}
          </svg>

          {/* Lore boxes */}
          {levels.map((level, i) => (
            <div key={i} className="flex flex-col justify-center gap-20">
              {level.map((lore) => {
                const n = lores.get(lore._id)!;
                return (
                  <Lore
                    key={lore._id}
                    lore={{ ...n, _id: lore._id, next: lore.next }}
                    refs={refs}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </PinchZoomWrapper>
    </>
  );
}

function Levels({ levels }: { levels: PageType["lvls"] }) {
  const [showLevels, setShowLevels] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLevelChange = (level: number) => {
    setShowLevels(false);
    router.push(`${pathname}?level=${level}`);
  };

  return (
    <>
      <div
        onClick={() => setShowLevels((val) => !val)}
        className="fixed top-3 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-4 py-2 pr-2 text-sm font-medium text-white"
      >
        {levels[0].title}
        <div className="rounded-full p-1 hover:bg-white/15">
          <GoTriangleDown className={`transition-all ${showLevels ? "rotate-180" : ""}`} />
        </div>
      </div>
      {showLevels && (
        <div className="fixed top-14 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-3 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white">
          {levels.map((level, idx) => (
            <div
              key={level.id}
              onClick={() => handleLevelChange(idx)}
              className="hover:text-white/80"
            >
              {level.title}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
