import React from "react";

const calculateEdges = ({
  lores,
  levels,
  containerRef,
  htmlLoresRef,
}: {
  lores: { _id: string; next: string[] }[];
  levels: { _id: string; next: string[] }[][];
  containerRef: React.RefObject<HTMLDivElement | null>;
  htmlLoresRef: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
}) => {
  if (!containerRef.current) return;
  const containerBox = containerRef.current.getBoundingClientRect();
  const parentLoresMap = new Map<string, string[]>();
  lores.forEach((n) => {
    n.next.forEach((childId) => {
      if (!parentLoresMap.has(childId)) {
        parentLoresMap.set(childId, []);
      }
      parentLoresMap.get(childId)!.push(n._id);
    });
  });

  const result: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    paddingLeft?: number;
  }[] = [];

  const edgesBasedonY = new Map<number, { loreId: string }>();
  levels.forEach((level) => {
    const allEdgesOfThisLvl: string[] = [];
    level.forEach((n) => {
      n.next.forEach((childId) => {
        allEdgesOfThisLvl.push(`${childId}-${n._id}`);
      });
    });

    level.forEach((lore) => {
      const firstLore = htmlLoresRef.current?.[lore._id];
      if (!firstLore) return;

      const firstLoreMeasure = firstLore.getBoundingClientRect();

      lore.next.forEach((nid, idx) => {
        const nextLore = htmlLoresRef.current?.[nid];
        if (!nextLore) return;
        const nextLoreMeasure = nextLore.getBoundingClientRect();
        const prevLores = parentLoresMap.get(nid) || [];

        const fromX = firstLoreMeasure.left - containerBox.left + firstLoreMeasure.width;
        const fromY = firstLoreMeasure.top - containerBox.top + firstLoreMeasure.height / 2;
        const toX = nextLoreMeasure.left - containerBox.left;
        const toY = nextLoreMeasure.top - containerBox.top + nextLoreMeasure.height / 2;

        const indexOfTheEdgeOfTheParentLore = idx;
        const totalEdgesOfTheParentLore = lore.next.length;
        const totalEdgesOfTheDestinationLore = prevLores.length;
        const indexOfTheEdgeOfTheDestinationLore = prevLores.indexOf(lore._id);
        let finalFromY =
          fromY + (indexOfTheEdgeOfTheParentLore - (totalEdgesOfTheParentLore - 1) / 2) * 10;
        let finalToY =
          toY -
          (indexOfTheEdgeOfTheDestinationLore - (totalEdgesOfTheDestinationLore - 1) / 2) * 10;

        if (edgesBasedonY.has(finalToY) && edgesBasedonY.get(finalToY)!.loreId !== lore._id) {
          finalToY = finalToY + 10;
        }

        result.push({
          from: {
            x: fromX,
            y: finalFromY,
          },
          to: {
            x: toX,
            y: finalToY,
          },
          paddingLeft: allEdgesOfThisLvl.indexOf(`${nid}-${lore._id}`) * 20,
        });
        if (!edgesBasedonY.has(finalFromY)) {
          edgesBasedonY.set(finalFromY, { loreId: nid });
        }
        if (!edgesBasedonY.has(finalToY)) {
          edgesBasedonY.set(finalToY, { loreId: lore._id });
        }
      });
    });
  });

  return result;
};

export default calculateEdges;
