import Image from "next/image";
import React from "react";
import { useOpenedNodeContext } from "../contexts/OpenedNodeContext";
import { NodeType } from "../../types/nodeTypes";

type Props = {
  node: NodeType;
  refs: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
};

const Node = ({ node, refs }: Props) => {
  const { setNode } = useOpenedNodeContext();

  return (
    <div
      key={node._id}
      ref={(el) => {
        refs.current[node._id] = el;
      }}
      style={{
        marginRight: node.next.length * 10,
      }}
      onClick={() => setNode(node)}
      className="w-[230px] h-[129.375px] bg-white rounded-lg flex items-center justify-center p-1 cursor-pointer"
    >
      <Image
        src="/first-cutscene.jpg"
        alt="node thumbnail"
        width={230}
        height={130}
        className="rounded-lg w-full h-full object-cover z-0"
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
