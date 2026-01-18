import React from "react";
import Sidebar from "./_components/Sidebar";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex h-screen min-h-0 min-w-0 flex-1 flex-col bg-black/3">{children}</div>
    </div>
  );
};

export default layout;
