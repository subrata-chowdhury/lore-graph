"use client";
import Image from "next/image";
import nbg from "@/assets/night.webp";
import Menubar from "./_components/Menubar";
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import Edge from "./_components/Edge";
import Node from "./_components/Node";
import calculateEdges from "../libs/edgeCalculationLogic";
import PinchZoomWrapper from "./_components/PinchZoomFeature";
import { NodeType } from "../types/nodeTypes";
import NodeModal from "./_components/NodeModal/NodeModal";

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

const data: NodeType[] = [
  { _id: "a", next: ["b"], type: "youtube", src: "ShB3vNlSdDA" },
  {
    _id: "b",
    title: "Node B",
    description: `On the Insert tab, the galleries include items that are designed to coordinate with the overall look of your document. You can use these galleries to insert tables, headers, footers, lists, cover pages, and other document building blocks. When you create pictures, charts, or diagrams, they also coordinate with your current document look.

    You can easily change the formatting of selected text in the document text by choosing a look for the selected text from the Quick Styles gallery on the Home tab. You can also format text directly by using the other controls on the Home tab. Most controls offer a choice of using the look from the current theme or using a format that you specify directly.

    To change the overall look of your document, choose new Theme elements on the Page Layout tab. To change the looks available in the Quick Style gallery, use the Change Current Quick Style Set command. Both the Themes gallery and the Quick Styles gallery provide reset commands so that you can always restore the look of your document to the original contained in your current template.
`,
    type: "youtube",
    src: "ShB3vNlSdDA",
    viewsCount: 123456,
    next: ["c", "d"],
    updatedAt: new Date().toISOString(),
    createdBy: "UserNameHandler",
    createdById: "user123",
    likesCount: 7890,
    tags: ["example", "node"],
  },
  { _id: "c", next: ["e", "f", "j", "k", "l", "m", "n"] },
  { _id: "d", next: ["g"] },
  { _id: "e", next: ["h"] },
  { _id: "f", next: ["i"] },
  { _id: "g", next: ["h"] },
  { _id: "h", next: [] },
  { _id: "i", next: [] },
  { _id: "j", next: [] },
  { _id: "k", next: [] },
  { _id: "l", next: [] },
  { _id: "m", next: [] },
  { _id: "n", next: [] },
] as NodeType[];

export function GraphView() {
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

  console.log("rerender graph view");

  return (
    <>
      <NodeModal />
      <div className="fixed top-5 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15">
        Genshin Impact Timeline Visualizer
      </div>
      <PinchZoomWrapper>
        <div ref={containerRef} className="relative my-5 grid min-h-125 grid-flow-col gap-35 px-20">
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
            <div key={i} className="flex flex-col justify-center gap-20">
              {level.map((id) => {
                const n = map.current.get(id)!;
                return <Node key={id} node={n} refs={refs} />;
              })}
            </div>
          ))}
        </div>
      </PinchZoomWrapper>
    </>
  );
}
