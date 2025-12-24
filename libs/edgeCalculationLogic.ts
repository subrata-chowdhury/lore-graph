const calculateEdges = ({
  nodes,
  levels,
  containerRef,
  htmlNodesRef,
  nodeMapRef,
}: {
  nodes: { _id: string; next: string[] }[];
  levels: string[][];
  containerRef: React.RefObject<HTMLDivElement | null>;
  htmlNodesRef: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
  nodeMapRef: React.RefObject<Map<string, { _id: string; next: string[] }>>;
}) => {
  if (!containerRef.current) return;
  const containerBox = containerRef.current.getBoundingClientRect();

  const prevNodesMapRef = new Map(
    nodes.map((n) => {
      const filteredNodes = nodes
        .filter((nd) => nd.next.includes(n._id))
        .map((nd) => nd._id);
      return [n._id, filteredNodes];
    })
  );

  const result: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    paddingLeft?: number;
  }[] = [];

  const edgesBasedonY = new Map<number, { nodeId: string }>();
  nodes.forEach((node) => {
    const firstNode = htmlNodesRef.current[node._id];
    if (!firstNode) return;

    const firstNodeMeasure = firstNode.getBoundingClientRect();

    const findNodeIndex = (levels: string[][], id: string) => {
      for (const lv of levels) {
        const idx = lv.indexOf(id);
        if (idx !== -1) return { index: idx, lvl: lv };
      }
      return { index: -1, lvl: [] };
    };
    const { lvl: currentLvl } = findNodeIndex(levels, node._id);
    let allEdgesOfThisLvl: string[] = [];
    for (const n in currentLvl) {
      allEdgesOfThisLvl = [
        ...allEdgesOfThisLvl,
        ...(nodeMapRef.current
          .get(currentLvl[n])
          ?.next.map((e) => `${e}-${currentLvl[n]}`) || []),
      ];
    }

    node.next.forEach((nid, idx) => {
      const nextNode = htmlNodesRef.current[nid];
      if (!nextNode) return;
      const nextNodeMeasure = nextNode.getBoundingClientRect();
      const prevNodes = prevNodesMapRef.get(nid) || [];

      const fromX =
        firstNodeMeasure.left - containerBox.left + firstNodeMeasure.width;
      const fromY =
        firstNodeMeasure.top - containerBox.top + firstNodeMeasure.height / 2;
      const toX = nextNodeMeasure.left - containerBox.left;
      const toY =
        nextNodeMeasure.top - containerBox.top + nextNodeMeasure.height / 2;

      const indexOfTheEdgeOfTheParentNode = idx;
      const totalEdgesOfTheParentNode = node.next.length;
      const totalEdgesOfTheDestinationNode = prevNodes.length;
      const indexOfTheEdgeOfTheDestinationNode = prevNodes.indexOf(node._id);
      let finalFromY =
        fromY +
        (indexOfTheEdgeOfTheParentNode - (totalEdgesOfTheParentNode - 1) / 2) *
          10;
      let finalToY =
        toY -
        (indexOfTheEdgeOfTheDestinationNode -
          (totalEdgesOfTheDestinationNode - 1) / 2) *
          10;

      if (
        edgesBasedonY.has(finalToY) &&
        edgesBasedonY.get(finalToY)!.nodeId !== node._id
      ) {
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

  return result;
};

export default calculateEdges;
