
// app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/libs/socket"; // Import your hook

export default function ChatPage() {
  const socket = useSocket();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on("receive-message", (data: string) => {
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup listener to avoid duplicates
    return () => {
      socket.off("receive-message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (socket) {
      socket.emit("send-message", msg);
      setMsg("");
    }
  };

  return (
    <div className="p-10">
      <h1>Socket.io Chat</h1>
      <div className="border p-4 mb-4 h-64 overflow-y-scroll">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <input
        className="border p-2 mr-2 text-black"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      <button 
        className="bg-blue-500 text-white p-2" 
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  );
}