"use client";
import Edge from "@/app/_components/Edge";
import PinchZoomWrapper from "@/app/_components/PinchZoomFeature";
import calculateEdges from "@/libs/edgeCalculationLogic";
import { NodeType } from "@/types/nodeTypes";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BiMinus, BiPencil, BiPlus, BiTrash } from "react-icons/bi";
import NodeFinder from "./_components/NodeFinder";
import Title from "@/ui/components/Title";
import { toast } from "react-toastify";
import EditableNode from "./_components/EditableNode";
import Input from "@/ui/components/Inputs/Input";

type Props = {
  onAdd: ({ id, title }: { id: string; title: string }) => void;
  onCancel: () => void;
};

const LevelForm = ({ onAdd = () => {}, onCancel = () => {} }: Props) => {
  const [levelName, setLevelName] = useState<string>("");
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
  const [nodes, setNodes] = useState<Map<string, NodeType>>(new Map());
  const [levels, setLevels] = useState<{ _id: string; next: string[] }[][]>([]);
  const [showNodeSelector, setShowNodeSelector] = useState<null | {
    col: number;
    row: number;
  }>(null);
  const [connectStart, setConnectStart] = useState<{ nodeId: string } | null>(null);
  const connectionMap = useRef<Map<string, { _id: string; next: string[] }>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleNodeSelect = (node: NodeType) => {
    if (showNodeSelector) {
      // Check if node already exists in any level
      if (levels.some((level) => level.some((n) => n._id === node._id))) {
        toast.warn("This node is already added to the graph. You can't add it again.");
        return;
      }
      // Deep copy levels
      const newLevels = levels.map((lvl) => lvl.map((n) => ({ ...n, next: [...n.next] })));

      if (newLevels[showNodeSelector.col].length === showNodeSelector.row) {
        newLevels[showNodeSelector.col].push({ _id: node._id, next: [] });
      } else {
        const prevNode = newLevels[showNodeSelector.col][showNodeSelector.row];
        const prevId = prevNode._id;

        // Replace node but keep connections
        newLevels[showNodeSelector.col][showNodeSelector.row] = {
          _id: node._id,
          next: prevNode.next,
        };

        // Update incoming connections from other nodes
        newLevels.forEach((lvl) => {
          lvl.forEach((n) => {
            const idx = n.next.indexOf(prevId);
            if (idx !== -1) {
              n.next[idx] = node._id;
            }
          });
        });
      }

      setLevels(newLevels);
      if (!nodes.has(node._id))
        setNodes((prev) => {
          const newMap = new Map(prev);
          newMap.set(node._id, node);
          return newMap;
        });
      setShowNodeSelector(null);
    }
  };

  const handleConnect = (nodeId: string | undefined, nextId: string) => {
    if (!nodeId) return;

    const parentNode = levels.flat().find((n) => n._id === nodeId);

    if (parentNode && parentNode.next.includes(nextId)) {
      toast.warn("This connection already exists.");
      setConnectStart(null);
      return;
    }

    const nodeIdLevel = levels.findIndex((level) => level.some((n) => n._id === nodeId));
    const nextIdLevel = levels.findIndex((level) => level.some((n) => n._id === nextId));

    if (nodeIdLevel === -1 || nextIdLevel === -1) {
      toast.error("One of the nodes is not found in any level.");
      setConnectStart(null);
      return;
    }

    if (nextIdLevel <= nodeIdLevel) {
      toast.warn("Cannot connect to a node in the same or a previous level.");
      setConnectStart(null);
      return;
    }

    const newLevels = levels.map((lvl) => lvl.map((n) => ({ ...n, next: [...n.next] })));

    const nodeToUpdate = newLevels[nodeIdLevel].find((n) => n._id === nodeId);
    if (nodeToUpdate) {
      nodeToUpdate.next.push(nextId);
      setLevels(newLevels);
    }

    setConnectStart(null);
  };

  const calculateEdgesAndUpdate = () => {
    if (levels.length > 0) {
      const flatNodes = levels.flat();

      const result = calculateEdges({
        nodes: flatNodes,
        levels,
        containerRef,
        htmlNodesRef: refs,
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

  const handleNodeDelete = (nodeId: string) => {
    // Filter out the node from levels
    const newLevels = levels.map((lvl) =>
      lvl.filter((n) => n._id !== nodeId).map((n) => ({ ...n, next: [...n.next] }))
    );

    // Remove connections to this node
    newLevels.forEach((lvl) => {
      lvl.forEach((n) => {
        n.next = n.next.filter((id) => id !== nodeId);
      });
    });

    setLevels(newLevels);
    setNodes((prev) => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
  };

  const removeConnection = (parentId: string | undefined, childId: string | undefined) => {
    if (!parentId || !childId) return;

    const newLevels = levels.map((lvl) =>
      lvl.map((n) => {
        if (n._id === parentId) {
          return {
            ...n,
            next: n.next.filter((id) => id !== childId),
          };
        }
        return n;
      })
    );

    setLevels(newLevels);
  };

  useEffect(() => {
    // fetch nData
    setNodes(new Map());

    // fetch connection data
    connectionMap.current = new Map();

    // set levels data
    setLevels([[]]);

    const handleContextMenu = (event: MouseEvent) => {
      // 1. Prevent the default browser menu
      // event.preventDefault();
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Required for Chrome
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useLayoutEffect(() => {
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
  }, [levels]);

  return (
    <>
      <div className="mb-4 flex flex-col text-sm">
        <Input
          label="Level Name (required)"
          description="Give this level a name that describes its purpose or content. This will be visible to users."
          type="text"
          placeholder="Level Name"
          max={150}
          value={levelName}
          onChange={(val) => setLevelName(val)}
          labelClass="font-semibold"
        />
      </div>
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
              <div
                key={i}
                className="relative flex flex-col justify-center gap-20 border-r border-dashed"
              >
                {level.map((node, index) => {
                  const n = nodes.get(node._id)!;
                  return (
                    <EditableNode
                      key={node._id + index}
                      node={{ ...n, _id: node._id, next: node.next }}
                      refs={refs}
                      onDeleteClick={() => handleNodeDelete(node._id)}
                      onEditClick={() => setShowNodeSelector({ col: i, row: index })}
                      onConnectClick={() => setConnectStart({ nodeId: node._id })}
                      onConnectCancelClick={() => setConnectStart(null)}
                      connectionOf={connectStart?.nodeId}
                      onSecondConnectClick={() => handleConnect(connectStart?.nodeId, node._id)}
                      nodes={nodes}
                      onDeleteConnction={removeConnection}
                    />
                  );
                })}
                <div
                  onClick={() => setShowNodeSelector({ col: i, row: level.length })}
                  className="mr-12 flex aspect-video w-57.5 cursor-pointer items-center justify-center rounded-lg border border-black/10 bg-white p-1"
                >
                  <BiPlus size={24} />
                </div>
                <div className="absolute top-1/2 right-0 flex translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col gap-4">
                  <Title title="Add a Column Here" className="shadow">
                    <div
                      className="rounded-lg bg-white p-3 shadow"
                      onClick={() => {
                        const newLevels = [...levels];
                        newLevels.splice(i + 1, 0, []);
                        setLevels(newLevels);
                      }}
                    >
                      <BiPlus />
                    </div>
                  </Title>
                  <Title title="Remove the right side Column" className="shadow">
                    <div
                      className="rounded-lg bg-white p-3 shadow"
                      onClick={() => {
                        const newLevels = [...levels];
                        newLevels.splice(i + 1, 1);
                        setLevels(newLevels);
                      }}
                    >
                      <BiMinus />
                    </div>
                  </Title>
                </div>
              </div>
            ))}
          </div>
        </PinchZoomWrapper>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onCancel}
          className="cursor-pointer rounded-full bg-black/10 px-5 py-2 text-sm font-semibold text-black hover:bg-black/20"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (levelName.length <= 0) {
              toast.error("Level name is required.");
              return;
            }
            console.log(levels);
            onAdd({ id: new Date().getTime().toString(), title: levelName });
          }}
          className="cursor-pointer rounded-full bg-black/80 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70"
        >
          Add
        </button>
      </div>
      <NodeFinder
        isOpen={!!showNodeSelector}
        onClose={() => setShowNodeSelector(null)}
        onSelect={handleNodeSelect}
      />
    </>
  );
};

export default LevelForm;
