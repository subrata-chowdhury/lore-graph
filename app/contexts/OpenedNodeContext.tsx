'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NodeType } from '../../types/nodeTypes';

interface OpenedNodeState {
    node: NodeType | null;
    setNode: (node: NodeType | null) => void;
}

const OpenedNodeContext = createContext<OpenedNodeState | undefined>(undefined);

export function OpenedNodeProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<NodeType | null>(null);

  const value = {
    node,
    setNode,
  };

  return <OpenedNodeContext.Provider value={value}>{children}</OpenedNodeContext.Provider>;
}

export function useOpenedNodeContext() {
  const context = useContext(OpenedNodeContext);
  if (context === undefined) {
    throw new Error('useOpenedNodeContext must be used within an OpenedNodeProvider');
  }
  return context;
}