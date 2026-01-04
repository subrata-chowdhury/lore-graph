import { NodeType } from "@/types/nodeTypes";
import { RefObject, useState } from "react";
import { PiGraphDuotone } from "react-icons/pi";
import Modal from "@/ui/components/Modal";
import Node from "@/app/_components/Node";
import { BiMinus, BiPencil, BiPlus, BiTrash } from "react-icons/bi";
import Title from "@/ui/components/Title";
import { TbTrash } from "react-icons/tb";
import { CgClose } from "react-icons/cg";

interface NodeTypeWithNext extends NodeType {
  next: string[];
}

type EditableNodeProp = {
  onEditClick: () => void;
  onDeleteClick: () => void;
  node: NodeTypeWithNext;
  refs: RefObject<{ [key: string]: HTMLDivElement | null }>;
  onConnectClick: () => void;
  onConnectCancelClick: () => void;
  connectionOf?: string;
  onSecondConnectClick: () => void;
  nodes: Map<string, NodeType>;
  onDeleteConnction: (parentId: string, childId: string) => void;
};

export default function EditableNode({
  onDeleteClick = () => {},
  onEditClick = () => {},
  node,
  refs,
  onConnectClick,
  onConnectCancelClick,
  connectionOf,
  onSecondConnectClick,
  nodes,
  onDeleteConnction,
}: EditableNodeProp) {
  const [showConnections, setShowConnections] = useState(false);

  return (
    <>
      <div className="group relative">
        <div className="absolute top-0 left-0 z-10 flex h-full w-57.5 gap-0 rounded-lg bg-linear-30 from-transparent to-white p-2 opacity-0 transition-all group-hover:opacity-100">
          <div
            className="mb-auto ml-auto cursor-pointer rounded-full p-2 hover:bg-black/10"
            onClick={() => onEditClick()}
          >
            <BiPencil size={20} />
          </div>
          <div
            className="mb-auto cursor-pointer rounded-full p-2 hover:bg-black/10"
            onClick={() => onDeleteClick()}
          >
            <BiTrash size={20} />
          </div>
          <div className="absolute top-1/2 right-0 flex translate-x-1/2 -translate-y-1/2 flex-col gap-1">
            <Title
              title={connectionOf !== node._id ? "Create Connection" : "Turn off connect mode"}
              className="shadow"
            >
              {connectionOf !== node._id ? (
                <div className="rounded-lg bg-white p-2 shadow" onClick={() => onConnectClick()}>
                  <BiPlus />
                </div>
              ) : (
                <div
                  className="rounded-lg bg-white p-2 shadow"
                  onClick={() => onConnectCancelClick()}
                >
                  <BiMinus />
                </div>
              )}
            </Title>
            <Title title={"See Conections"}>
              <div
                className="rounded-lg bg-white p-2 shadow"
                onClick={() => setShowConnections((val) => !val)}
              >
                <PiGraphDuotone />
              </div>
            </Title>
          </div>
        </div>
        {connectionOf && connectionOf !== node._id && (
          <div className="absolute top-1/2 left-0 z-10 -translate-x-1/2 -translate-y-1/2">
            <Title title="Connect to this node" className="shadow">
              <div
                className="rounded-lg bg-white p-2 shadow"
                onClick={() => onSecondConnectClick()}
              >
                <BiPlus />
              </div>
            </Title>
          </div>
        )}
        <Node node={node} refs={refs} />
        {showConnections && (
          <ConnectionModal
            connections={node.next || []}
            isOpen={showConnections}
            onClose={() => setShowConnections(false)}
            nodes={nodes}
            onDeleteConnction={(id) => {
              onDeleteConnction(node._id, id);
              setShowConnections(false);
            }}
          />
        )}
      </div>
    </>
  );
}

const ConnectionModal = ({
  connections = [],
  isOpen,
  onClose = () => {},
  nodes,
  onDeleteConnction,
}: {
  connections: string[];
  isOpen: boolean;
  onClose: () => void;
  nodes: Map<string, NodeType>;
  onDeleteConnction: (id: string) => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-black/20 p-4 px-5">
        <span className="font-semibold">Connected Nodes</span>
        <button onClick={onClose} className="cursor-pointer text-sm text-gray-500 hover:text-black">
          <CgClose size={20} />
        </button>
      </div>
      <div className="max-h-[80vh] overflow-auto p-4">
        {connections?.length > 0 &&
          connections.map((connection) => {
            const node = nodes.get(connection);
            if (!node) return;
            return (
              <div
                className="flex gap-2 rounded-lg bg-black/10 p-3 pr-4"
                key={node._id || connection}
              >
                <div>
                  <img src={node?.thumbnailUrl} className="aspect-video w-25 rounded-md" />
                </div>
                <div>
                  <div className="truncate text-xs font-semibold">{node.title}</div>
                  <div className="truncate text-xs text-black/50">{node._id}</div>
                </div>
                <div className="ml-auto">
                  <TbTrash className="cursor-pointer" onClick={() => onDeleteConnction(node._id)} />
                </div>
              </div>
            );
          })}
      </div>
      <div className="flex justify-end p-4 pt-0">
        <button
          onClick={() => {
            connections.forEach((id) => onDeleteConnction(id));
            onClose();
          }}
          className="cursor-pointer rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
        >
          Clear All
        </button>
      </div>
    </Modal>
  );
};
