import Image from "next/image";
import React from "react";
import { useOpenedNodeContext } from "../contexts/OpenedNodeContext";
import { NodeType } from "../../types/nodeTypes";

interface NodeTypeWithNext extends NodeType {
  next: string[];
}

type Props = {
  node: NodeTypeWithNext;
  refs?: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
  className?: string;
};

const Node = ({ node, refs, className }: Props) => {
  const { setNode } = useOpenedNodeContext();
  if (!node) return null;

  return (
    <div
      key={node._id}
      ref={(el) => {
        if (refs) refs.current[node._id] = el;
      }}
      style={{
        marginRight: node.next.length * 10,
      }}
      onClick={() => setNode(node)}
      className={`flex aspect-video w-[230px] cursor-pointer items-center justify-center rounded-lg bg-white p-1 ${className || ""}`}
    >
      <Image
        src={node?.thumbnailUrl || "/first-cutscene.jpg"}
        alt="node thumbnail"
        width={230}
        height={130}
        className="z-0 h-full w-full rounded-lg object-cover"
      />
    </div>
  );
};

{
  /* <div className="relative top-8 left-20 w-60 h-44 bg-white rounded-lg p-1 pb-6">
    <div className="bg-blue-950 rounded-xl w-full h-full"></div>
</div> */
}

export default Node;
