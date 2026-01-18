import React from "react";
import Sidebar from "./users/[username]/_components/Sidebar";
import Topbar from "./users/[username]/_components/Topbar";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex h-screen min-h-0 min-w-0 flex-1 flex-col bg-black/3">
        <Topbar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default layout;
