import React from "react";
import Menubar from "../_components/Menubar";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center">
      <Menubar />
      <div className="h-screen max-h-screen min-h-0 min-w-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default layout;
