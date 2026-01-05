import React from "react";

const calculateEdges = ({
  nodes,
  levels,
  containerRef,
  htmlNodesRef,
}: {
  nodes: { _id: string; next: string[] }[];
  levels: { _id: string; next: string[] }[][];
  containerRef: React.RefObject<HTMLDivElement | null>;
  htmlNodesRef: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
}) => {
  if (!containerRef.current) return;
  const containerBox = containerRef.current.getBoundingClientRect();
  const parentNodesMap = new Map<string, string[]>();
  nodes.forEach((n) => {
    n.next.forEach((childId) => {
      if (!parentNodesMap.has(childId)) {
        parentNodesMap.set(childId, []);
      }
      parentNodesMap.get(childId)!.push(n._id);
    });
  });

  const result: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    paddingLeft?: number;
  }[] = [];

  const edgesBasedonY = new Map<number, { nodeId: string }>();
  levels.forEach((level) => {
    const allEdgesOfThisLvl: string[] = [];
    level.forEach((n) => {
      n.next.forEach((childId) => {
        allEdgesOfThisLvl.push(`${childId}-${n._id}`);
      });
    });

    level.forEach((node) => {
      const firstNode = htmlNodesRef.current?.[node._id];
      if (!firstNode) return;

      const firstNodeMeasure = firstNode.getBoundingClientRect();

      node.next.forEach((nid, idx) => {
        const nextNode = htmlNodesRef.current?.[nid];
        if (!nextNode) return;
        const nextNodeMeasure = nextNode.getBoundingClientRect();
        const prevNodes = parentNodesMap.get(nid) || [];

        const fromX = firstNodeMeasure.left - containerBox.left + firstNodeMeasure.width;
        const fromY = firstNodeMeasure.top - containerBox.top + firstNodeMeasure.height / 2;
        const toX = nextNodeMeasure.left - containerBox.left;
        const toY = nextNodeMeasure.top - containerBox.top + nextNodeMeasure.height / 2;

        const indexOfTheEdgeOfTheParentNode = idx;
        const totalEdgesOfTheParentNode = node.next.length;
        const totalEdgesOfTheDestinationNode = prevNodes.length;
        const indexOfTheEdgeOfTheDestinationNode = prevNodes.indexOf(node._id);
        let finalFromY =
          fromY + (indexOfTheEdgeOfTheParentNode - (totalEdgesOfTheParentNode - 1) / 2) * 10;
        let finalToY =
          toY -
          (indexOfTheEdgeOfTheDestinationNode - (totalEdgesOfTheDestinationNode - 1) / 2) * 10;

        if (edgesBasedonY.has(finalToY) && edgesBasedonY.get(finalToY)!.nodeId !== node._id) {
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
          paddingLeft: allEdgesOfThisLvl.indexOf(`${nid}-${node._id}`) * 20,
        });
        if (!edgesBasedonY.has(finalFromY)) {
          edgesBasedonY.set(finalFromY, { nodeId: nid });
        }
        if (!edgesBasedonY.has(finalToY)) {
          edgesBasedonY.set(finalToY, { nodeId: node._id });
        }
      });
    });
  });

  return result;
};

export default calculateEdges;
