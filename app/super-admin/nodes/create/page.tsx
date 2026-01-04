"use client";
import fetcher from "@/libs/fetcher";
import { NodeType } from "@/types/nodeTypes";
import NodeForm from "@/app/_components/Forms/NodeForm";
import React, { useState } from "react";
import { toast } from "react-toastify";

type Props = {};

const NodeFormPage = (props: Props) => {
  const [nodeData, setNodeData] = useState<
    Omit<
      NodeType,
      "_id" | "createdAt" | "updatedAt" | "likesCount" | "viewsCount" | "createdBy" | "createdById"
    >
  >({
    title: "",
    description: "",
    tags: [],
    type: "youtube",
    visibility: "private",
  });

  async function saveNode() {
    try {
      const { body, error } = await fetcher.post<
        typeof nodeData,
        { success: boolean; error?: string }
      >("/super-admin/nodes/new", nodeData);

      if (body?.success) {
        toast.success("Node created successfully");
        setNodeData({
          title: "",
          description: "",
          tags: [],
          type: "youtube",
          visibility: "private",
          src: "",
          thumbnailUrl: "",
        });
      } else {
        toast.error(error || body?.error || "Failed to create node");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  return <NodeForm nodeData={nodeData} onNodeDataChange={setNodeData} onSave={saveNode} />;
};

export default NodeFormPage;
