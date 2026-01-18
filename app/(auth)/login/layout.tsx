import { Metadata } from "next";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = (props: Props) => {
  return <>{props.children}</>;
};

export default layout;

export const metadata: Metadata = {
  title: "Log in to Lore Graph",
  description: "Login to your Lore Graph account.",
};
