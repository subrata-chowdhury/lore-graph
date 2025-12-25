"use client";
import Modal from "@/ui/components/Modal";
import { useOpenedNodeContext } from "../../contexts/OpenedNodeContext";
import YouTube, { YouTubeEvent } from "react-youtube";
import { useEffect, useState } from "react";
import { PiYoutubeLogo } from "react-icons/pi";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import Link from "next/link";
import { PiShareFatBold } from "react-icons/pi";
import { BsChatSquareText } from "react-icons/bs";
import CommentSection from "./components/CommenSection";
import { AnimatePresence } from "framer-motion";
import { CommentType } from "@/types/commentTypes";
import { IoIosArrowBack } from "react-icons/io";
import numberFormatter from "@/libs/numberFormatter";
import { useSocket } from "@/app/contexts/SocketContext";

const NodeModal = () => {
  const { node, setNode } = useOpenedNodeContext();
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [expandDescription, setExpandDescription] = useState(false);
  const [liveViewers, setLiveViewers] = useState<number>(0);
  const socket = useSocket();

  // 1. Config: Hide default controls
  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      controls: 1, // Hides the bottom control bar
      modestbranding: 1, // Hides the YouTube logo (mostly)
      rel: 0, // Disables related videos at the end
    },
  };

  const onReady = () => {
    setLoading(false);
  };

  const onStateChange = (event: YouTubeEvent) => {
    // YouTube API State Codes:
    // -1 (Unstarted), 0 (Ended), 1 (Playing), 2 (Paused), 3 (Buffering), 5 (Cued)

    const state = event.data;

    if (state === 1) {
      console.log("Video Started / Playing");
    } else if (state === 2) {
      console.log("Video Paused");
    } else if (state === 0) {
      console.log("Video Ended");
    }
  };

  const socketCleanup = () => {
    if (!socket || !node) return;
    // Leave the room for this node
    socket.emit("leave-node-room", node._id);
    socket.off("room-count-update");
  };

  useEffect(() => {
    if (!socket || !node) return;
    // Join the room for this node
    socket.emit("join-node-room", node._id);
    // Listen for room count updates
    socket.on("room-count-update", (count: number) => {
      setLiveViewers(count);
    });
    // Cleanup on unmount or node change
    return () => socketCleanup();
  }, [socket, node]);

  return (
    <>
      {node && (
        <Modal
          onClose={() => {
            setNode(null);
            socketCleanup();
          }}
          className="bg-transparent!"
        >
          <div
            className={`flex max-h-[85vh] h-[85vh] max-w-[90vw] transition-all justify-center items-center`}
          >
            <div className="p-3 bg-white rounded-full my-auto cursor-pointer mr-6">
              <IoIosArrowBack size={24} />
            </div>
            <div
              className={`flex flex-1 flex-col overflow-y-auto scrollbar-hide z-5 h-full bg-white rounded-l-lg ${
                showComments ? "rounded-r-none" : "rounded-r-lg"
              }`}
            >
              {node.type === "youtube" && (
                <YouTube
                  videoId={node.src}
                  opts={opts}
                  onReady={onReady}
                  onStateChange={onStateChange}
                  className={
                    "rounded-t-md aspect-video w-[640px] h-[360px] min-h-[360px]" +
                    (loading ? " hidden" : "") +
                    (showComments ? " rounded-r-md" : "")
                  }
                />
              )}
              {loading && (
                <div className="w-[640px] h-[360px] bg-black/10 flex items-center justify-center animate-pulse">
                  Loading...
                </div>
              )}
              <div className="p-4 flex flex-col max-w-[640px]">
                <div className="font-semibold mb-1">{node.title || "N/A"}</div>
                <div className="mb-1 mr-auto flex gap-2 items-center w-full">
                  {node.type === "youtube" && (
                    <Link
                      href={`https://youtu.be/${node.src}`}
                      target="_blank"
                      className="flex items-center gap-1 text-sm px-3 py-1 bg-black/10 hover:bg-black/20 transition-colors rounded-full cursor-pointer"
                    >
                      <PiYoutubeLogo className="" size={20} />
                      <span className="align-middle">YouTube</span>
                    </Link>
                  )}
                  <div className="flex px-3 py-2 bg-black/10 rounded-full cursor-pointer ml-auto">
                    <button className="flex gap-1 pr-1.5 border-r border-black/20 text-xs font-semibold items-center">
                      <FiThumbsUp size={18} />
                      {node.likesCount || 0}
                    </button>
                    <button className="flex gap-1 pl-1.5 text-xs font-semibold items-center">
                      <FiThumbsDown size={18} />
                    </button>
                  </div>
                  <button
                    className="px-3 py-2 bg-black/10 rounded-lg cursor-pointer hover:bg-black/20 transition-colors"
                    onClick={() => setShowComments((val) => !val)}
                  >
                    <BsChatSquareText />
                  </button>
                  <button className="px-3 py-2 bg-black/10 rounded-lg cursor-pointer hover:bg-black/20 transition-colors">
                    <PiShareFatBold />
                  </button>
                </div>
                <div className="p-2 px-3 bg-black/10 rounded-lg text-sm">
                  <div className="flex font-semibold gap-2">
                    <div>{numberFormatter(node.viewsCount || 0)} views</div>
                    <div className="flex gap-2 ml-2">
                      <div className="w-1.5 h-1.5 my-auto rounded-full bg-green-600 animate-radar"></div>
                      {liveViewers} Live viewer
                    </div>
                    <div className="ml-2">
                      {new Date(node.updatedAt || "").toLocaleDateString() ||
                        ""}
                    </div>
                  </div>
                  <div
                    className="wrap-break-word whitespace-pre-wrap"
                    onClick={() => setExpandDescription((val) => !val)}
                  >
                    {node.description?.length > 100
                      ? expandDescription
                        ? node.description
                        : node.description.slice(0, 200) + "..."
                      : node.description}
                    {node.description?.length > 100 && (
                      <span className="text-black text-sm font-semibold ml-2 cursor-pointer">
                        {expandDescription ? "Show Less" : "Show More"}
                      </span>
                    )}
                    {!node.description && <div>No Description</div>}
                  </div>
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {showComments && (
                <CommentSection onClose={() => setShowComments(false)} />
              )}
            </AnimatePresence>
            <div className="p-3 bg-white rounded-full my-auto cursor-pointer rotate-180 ml-6">
              <IoIosArrowBack size={24} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default NodeModal;
