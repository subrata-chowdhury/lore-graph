"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Only one connection is created here
    const socketInstance = io();

    socketInstance.on("error", (data: string) => {
        toast.error(data);
      });

    socketInstance.on("connect", () => {
      console.log("Global Socket Connected:", socketInstance.id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      socketInstance.off("error");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
      throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}