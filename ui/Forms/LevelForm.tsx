"use client";
import Edge from "@/app/_components/Edge";
import Node from "@/app/_components/Node";
import PinchZoomWrapper from "@/app/_components/PinchZoomFeature";
import calculateEdges from "@/libs/edgeCalculationLogic";
import { NodeType } from "@/types/nodeTypes";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BiPlus, BiSearch } from "react-icons/bi";
import Modal from "../components/Modal";
import DropdownWithPaginatedSearch from "../components/Inputs/DropdownWithPaginatedSearch";
import Link from "next/link";

type Props = {};

const data: NodeType[] = [];

const LevelForm = (props: Props) => {
  const [nodeContainerSize, setNodeContainerSize] = useState({
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
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [levels, setLevels] = useState<string[][]>([]);
  const [showNodeSelector, setShowNodeSelector] = useState<null | {
    col: number;
    row: number;
  }>(null);
  const map = useRef(new Map(nodes.map((n) => [n._id, n])));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    console.log("calculation started", new Date().getTime());
    map.current = new Map(data.map((n) => [n._id, n]));
    setNodes(data);

    const newLevels = [
      ["a"],
      ["b"],
      ["c", "d"],
      ["e", "f", "g", "j", "k", "l", "m", "n"],
      ["h", "i"],
    ];
    setLevels(newLevels);

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
      if (nodes.length > 0 && levels.length > 0) {
        const result = calculateEdges({
          nodes,
          levels,
          containerRef,
          htmlNodesRef: refs,
          nodeMapRef: map,
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
      setNodeContainerSize({
        width: containerRef.current?.scrollWidth || 0,
        height: containerRef.current?.scrollHeight || 0,
      });
    };
    getMainContainerWidth();

    window.addEventListener("resize", calculateEdgesAndUpdate);

    return () => {
      window.removeEventListener("resize", calculateEdgesAndUpdate);
    };
  }, [nodes, levels]);

  return (
    <>
      <div className="flex flex-col">
        <div className={`text-sm font-semibold`}>Levels</div>
        <div className="text-sm text-black/60">
          Design the levels for this page by adding nodes and connecting them.
        </div>
      </div>
      <div className="relative mt-4 max-w-[calc(100vw-276px)] flex-1 overflow-auto rounded-lg bg-black/10">
        <PinchZoomWrapper>
          <div
            ref={containerRef}
            className="relative my-5 grid min-h-125 grid-flow-col gap-35 px-20"
          >
            {/* Edges SVGs */}
            <svg
              className="pointer-events-none absolute top-0 left-0"
              width={nodeContainerSize.width}
              height={nodeContainerSize.height}
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

            {/* Node boxes */}
            {levels.map((level, i) => (
              <div key={i} className="flex flex-col justify-center gap-20 border-r border-dashed">
                {level.map((id) => {
                  const n = map.current.get(id)!;
                  return <Node key={id} node={n} refs={refs} />;
                })}
                <div
                  onClick={() => setShowNodeSelector({ col: i, row: level.length })}
                  className="flex aspect-video w-45 cursor-pointer items-center justify-center rounded-lg border border-black/10 bg-white p-1"
                >
                  <BiPlus />
                </div>
              </div>
            ))}
          </div>
        </PinchZoomWrapper>
      </div>
      <div className="mt-4 flex gap-3">
        <button className="cursor-pointer rounded-full bg-black/10 px-5 py-2 text-sm font-semibold text-black hover:bg-black/20">
          Cancel
        </button>
        <button className="cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70">
          Add
        </button>
      </div>
      {showNodeSelector && (
        <Modal isOpen={!!showNodeSelector} onClose={() => setShowNodeSelector(null)}>
          <div className="border-b border-black/20 p-4 px-5">Select a Node</div>
          <div className="min-h-32 px-5 py-3">
            <div className="flex gap-3">
              <SearchBar
                onSearch={(value) => {
                  console.log("searching for", value);
                }}
              />
              <Link
                href="/super-admin/nodes/create"
                target="_blank"
                className="cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70"
              >
                Create New Node
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default LevelForm;

function SearchBar({ onSearch = () => {} }: { onSearch?: (value: string) => void }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex min-h-9 max-w-52 items-center gap-1 rounded border border-black/15 p-1 px-2 dark:border-white/30">
      <BiSearch size={20} className="my-auto" />
      <input
        className="w-full bg-transparent text-sm outline-none"
        value={searchValue}
        placeholder="Search"
        onChange={(e) => {
          setSearchValue(e.target.value);
          onSearch(e.target.value);
        }}
      />
    </div>
  );
}
