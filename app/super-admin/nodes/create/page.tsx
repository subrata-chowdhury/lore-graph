"use client";
import { NodeType } from "@/types/nodeTypes";
import NodeForm from "@/ui/Forms/NodeForm";
import React, { useState } from "react";

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
  });

  return <NodeForm nodeData={nodeData} onNodeDataChange={setNodeData} />;
};

export default NodeFormPage;
