"use client";
import Image from "next/image";
import nbg from "@/assets/night.webp";
import Menubar from "./_components/Menubar";
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import Edge from "./_components/Edge";
import Lore from "./_components/Lore";
import calculateEdges from "../libs/edgeCalculationLogic";
import PinchZoomWrapper from "./_components/PinchZoomFeature";
import { LoreType } from "../types/loreTypes";
import LoreModal from "./_components/LoreModal/LoreModal";
import { conData, lvlData, nData } from "./data/loreData";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Image
        src={nbg}
        alt="Night Background"
        width={540}
        height={268}
        className="fixed top-0 left-0 -z-20 min-h-screen w-full"
      />
      <div className="fixed top-0 left-0 -z-10 min-h-screen w-full bg-black/70"></div>
      <div className="flex h-screen w-screen">
        <Menubar />
        <GraphView />
      </div>
    </div>
  );
}

export function GraphView() {
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
  const [lores, setLores] = useState<Map<string, LoreType>>(new Map());
  const [levels, setLevels] = useState<{ _id: string; next: string[] }[][]>([]);
  const connectionMap = useRef<Map<string, { _id: string; next: string[] }>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    console.log("calculation started", new Date().getTime());

    // fetch nData
    setLores(nData);

    // fetch connection data
    const cMap = new Map(conData.map((item) => [item._id, item]));
    connectionMap.current = cMap;

    // set levels data
    setLevels(
      lvlData.map((level) => level.map((id) => ({ _id: id, next: cMap.get(id)?.next || [] })))
    );

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
      <div className="fixed top-5 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15">
        Genshin Impact Timeline Visualizer
      </div>
      <PinchZoomWrapper>
        <div ref={containerRef} className="relative my-5 grid min-h-125 grid-flow-col gap-35 px-20">
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
