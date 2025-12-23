"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the server
    const socketInstance = io({
      path: "/socket.io", // Matches the default path
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server", socketInstance.id);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};