"use client";
import Edge from "@/app/_components/Edge";
import PinchZoomWrapper from "@/app/_components/PinchZoomFeature";
import calculateEdges from "@/libs/edgeCalculationLogic";
import { LoreType } from "@/types/loreTypes";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BiMinus, BiPencil, BiPlus, BiTrash } from "react-icons/bi";
import LoreFinder from "./_components/LoreFinder";
import Title from "@/ui/components/Title";
import { toast } from "react-toastify";
import EditableLore from "./_components/EditableLore";
import Input from "@/ui/components/Inputs/Input";

type Props = {
  onAdd: ({ id, title }: { id: string; title: string }) => void;
  onCancel: () => void;
};

const LevelForm = ({ onAdd = () => {}, onCancel = () => {} }: Props) => {
  const [levelName, setLevelName] = useState<string>("");
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
  const [showLoreSelector, setShowLoreSelector] = useState<null | {
    col: number;
    row: number;
  }>(null);
  const [connectStart, setConnectStart] = useState<{ loreId: string } | null>(null);
  const connectionMap = useRef<Map<string, { _id: string; next: string[] }>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleLoreSelect = (lore: LoreType) => {
    if (showLoreSelector) {
      // Check if lore already exists in any level
      if (levels.some((level) => level.some((n) => n._id === lore._id))) {
        toast.warn("This lore is already added to the graph. You can't add it again.");
        return;
      }
      // Deep copy levels
      const newLevels = levels.map((lvl) => lvl.map((n) => ({ ...n, next: [...n.next] })));

      if (newLevels[showLoreSelector.col].length === showLoreSelector.row) {
        newLevels[showLoreSelector.col].push({ _id: lore._id, next: [] });
      } else {
        const prevLore = newLevels[showLoreSelector.col][showLoreSelector.row];
        const prevId = prevLore._id;

        // Replace lore but keep connections
        newLevels[showLoreSelector.col][showLoreSelector.row] = {
          _id: lore._id,
          next: prevLore.next,
        };

        // Update incoming connections from other lores
        newLevels.forEach((lvl) => {
          lvl.forEach((n) => {
            const idx = n.next.indexOf(prevId);
            if (idx !== -1) {
              n.next[idx] = lore._id;
            }
          });
        });
      }

      setLevels(newLevels);
      if (!lores.has(lore._id))
        setLores((prev) => {
          const newMap = new Map(prev);
          newMap.set(lore._id, lore);
          return newMap;
        });
      setShowLoreSelector(null);
    }
  };

  const handleConnect = (loreId: string | undefined, nextId: string) => {
    if (!loreId) return;

    const parentLore = levels.flat().find((n) => n._id === loreId);

    if (parentLore && parentLore.next.includes(nextId)) {
      toast.warn("This connection already exists.");
      setConnectStart(null);
      return;
    }

    const loreIdLevel = levels.findIndex((level) => level.some((n) => n._id === loreId));
    const nextIdLevel = levels.findIndex((level) => level.some((n) => n._id === nextId));

    if (loreIdLevel === -1 || nextIdLevel === -1) {
      toast.error("One of the lores is not found in any level.");
      setConnectStart(null);
      return;
    }

    if (nextIdLevel <= loreIdLevel) {
      toast.warn("Cannot connect to a lore in the same or a previous level.");
      setConnectStart(null);
      return;
    }

    const newLevels = levels.map((lvl) => lvl.map((n) => ({ ...n, next: [...n.next] })));

    const loreToUpdate = newLevels[loreIdLevel].find((n) => n._id === loreId);
    if (loreToUpdate) {
      loreToUpdate.next.push(nextId);
      setLevels(newLevels);
    }

    setConnectStart(null);
  };

  const calculateEdgesAndUpdate = () => {
    if (levels.length > 0) {
      const flatLores = levels.flat();

      const result = calculateEdges({
        lores: flatLores,
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

  const handleLoreDelete = (loreId: string) => {
    // Filter out the lore from levels
    const newLevels = levels.map((lvl) =>
      lvl.filter((n) => n._id !== loreId).map((n) => ({ ...n, next: [...n.next] }))
    );

    // Remove connections to this lore
    newLevels.forEach((lvl) => {
      lvl.forEach((n) => {
        n.next = n.next.filter((id) => id !== loreId);
      });
    });

    setLevels(newLevels);
    setLores((prev) => {
      const newMap = new Map(prev);
      newMap.delete(loreId);
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
    setLores(new Map());

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
          Design the levels for this page by adding lores and connecting them.
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
              <div
                key={i}
                className="relative flex flex-col justify-center gap-20 border-r border-dashed"
              >
                {level.map((lore, index) => {
                  const n = lores.get(lore._id)!;
                  return (
                    <EditableLore
                      key={lore._id + index}
                      lore={{ ...n, _id: lore._id, next: lore.next }}
                      refs={refs}
                      onDeleteClick={() => handleLoreDelete(lore._id)}
                      onEditClick={() => setShowLoreSelector({ col: i, row: index })}
                      onConnectClick={() => setConnectStart({ loreId: lore._id })}
                      onConnectCancelClick={() => setConnectStart(null)}
                      connectionOf={connectStart?.loreId}
                      onSecondConnectClick={() => handleConnect(connectStart?.loreId, lore._id)}
                      lores={lores}
                      onDeleteConnction={removeConnection}
                    />
                  );
                })}
                <div
                  onClick={() => setShowLoreSelector({ col: i, row: level.length })}
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
      <LoreFinder
        isOpen={!!showLoreSelector}
        onClose={() => setShowLoreSelector(null)}
        onSelect={handleLoreSelect}
      />
    </>
  );
};

export default LevelForm;
