import React from "react";
import { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return children;
};

export default layout;

export const metadata: Metadata = {
  title: "Settings",
  description: "Settings for Lore Graph app",
};
