import React from "react";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";
import { SidebarProvider } from "./_contexts/SidebarContext";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <div className="flex">
      <SidebarProvider>
        <Sidebar />
        <div className="flex h-screen min-h-0 min-w-0 flex-1 flex-col bg-black/3">
          <Topbar />
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
};

export default layout;
