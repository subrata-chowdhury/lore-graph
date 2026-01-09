"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { LoreType } from "../types/loreTypes";

interface OpenedLoreState {
  lore: LoreType | null;
  setLore: (lore: LoreType | null) => void;
}

const OpenedLoreContext = createContext<OpenedLoreState | undefined>(undefined);

export function OpenedLoreProvider({ children }: { children: ReactNode }) {
  const [lore, setLore] = useState<LoreType | null>(null);

  const value = {
    lore,
    setLore,
  };

  return <OpenedLoreContext.Provider value={value}>{children}</OpenedLoreContext.Provider>;
}

export function useOpenedLoreContext() {
  const context = useContext(OpenedLoreContext);
  if (context === undefined) {
    throw new Error("useOpenedLoreContext must be used within an OpenedLoreProvider");
  }
  return context;
}
