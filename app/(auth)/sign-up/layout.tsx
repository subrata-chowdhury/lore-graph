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
  title: "Sign Up | Lore Graph",
  description: "Sign up for a Lore Graph account.",
};
