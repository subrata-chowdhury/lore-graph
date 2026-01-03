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
import { LuRectangleHorizontal } from "react-icons/lu";
import Title from "@/ui/components/Title";
import { BsExclamationCircle } from "react-icons/bs";

const NodeModal = () => {
  const { node, setNode } = useOpenedNodeContext();
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [expandDescription, setExpandDescription] = useState(false);
  const [liveViewers, setLiveViewers] = useState<number>(0);
  const [isInFullscreen, setIsInFullscreen] = useState<boolean>(false);
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
            className={`flex ${
              isInFullscreen
                ? "h-screen max-h-screen w-screen max-w-screen"
                : "h-[85vh] max-h-[85vh] max-w-[90vw]"
            } items-center justify-center transition-all`}
          >
            <div
              className={`my-auto mr-6 cursor-pointer rounded-full bg-white p-3 ${
                isInFullscreen ? "hidden" : ""
              }`}
            >
              <IoIosArrowBack size={24} />
            </div>
            <div
              className={`scrollbar-hide z-5 flex h-full flex-1 flex-col overflow-y-auto rounded-l-lg bg-white ${
                showComments ? "rounded-r-none" : "rounded-r-lg"
              }`}
            >
              {node.type === "youtube" && (
                <YouTube
                  videoId={node.src}
                  opts={opts}
                  onReady={onReady}
                  onStateChange={onStateChange}
                  className={`aspect-video rounded-t-md ${
                    isInFullscreen ? "h-full max-h-[85vh] w-full" : "h-90 min-h-90 w-160"
                  } ${loading ? "hidden" : ""} ${showComments ? "rounded-r-md" : ""} `}
                />
              )}
              {loading && (
                <div className="flex aspect-video w-160 animate-pulse items-center justify-center bg-black/10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-b-transparent"></div>
                </div>
              )}
              <div className={`flex flex-col p-4 ${isInFullscreen ? "" : "max-w-160"}`}>
                <div className="mb-1 font-semibold">{node.title || "N/A"}</div>
                <div className="mr-auto mb-1 flex w-full items-center gap-2">
                  {node.createdById && (
                    <Link href={`/users/${node.createdById}`}>
                      <Title
                        title={
                          <div className="flex items-center gap-2">
                            <div className="text-xs">
                              Content added by{" "}
                              <span className="font-semibold">{node.createdBy || "Unknown"}</span>
                            </div>
                          </div>
                        }
                        className="left-0 [&>*:last-child]:left-0 [&>*:last-child]:translate-x-2"
                      >
                        <div className="h-7 w-7 rounded-full bg-black/10"></div>
                      </Title>
                    </Link>
                  )}
                  {node.type === "youtube" && (
                    <Link
                      href={`https://youtu.be/${node.src}`}
                      target="_blank"
                      className="flex cursor-pointer items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-sm transition-colors hover:bg-black/20"
                    >
                      <PiYoutubeLogo className="" size={20} />
                      <span className="align-middle">YouTube</span>
                    </Link>
                  )}
                  <div className="ml-auto flex cursor-pointer rounded-full bg-black/10 px-3 py-1.75">
                    <button className="flex items-center gap-1 border-r border-black/20 pr-1.5 text-xs font-semibold">
                      <FiThumbsUp size={18} />
                      {node.likesCount || 0}
                    </button>
                    <button className="flex items-center gap-1 pl-1.5 text-xs font-semibold">
                      <FiThumbsDown size={18} />
                    </button>
                  </div>
                  <button
                    className="cursor-pointer rounded-lg bg-black/10 px-3 py-2 transition-colors hover:bg-black/20"
                    onClick={() => setShowComments((val) => !val)}
                  >
                    <BsChatSquareText />
                  </button>
                  <button
                    className="cursor-pointer rounded-lg bg-black/10 px-2.5 py-1.5 transition-colors hover:bg-black/20"
                    onClick={() => setIsInFullscreen(!isInFullscreen)}
                  >
                    <LuRectangleHorizontal size={20} />
                  </button>
                  <button className="cursor-pointer rounded-lg bg-black/10 px-3 py-2 transition-colors hover:bg-black/20">
                    <PiShareFatBold />
                  </button>
                </div>
                <div className="rounded-lg bg-black/10 p-2 px-3 text-sm">
                  <div className="flex gap-2 font-semibold">
                    <div>{numberFormatter(node.viewsCount || 0)} views</div>
                    <div className="ml-2 flex gap-2">
                      <div className="animate-radar my-auto h-1.5 w-1.5 rounded-full bg-green-600"></div>
                      {liveViewers} Live viewer
                    </div>
                    <div className="ml-2">
                      {new Date(node.updatedAt || "").toLocaleDateString() || ""}
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
                      <span className="ml-2 cursor-pointer text-sm font-semibold text-black">
                        {expandDescription ? "Show Less" : "Show More"}
                      </span>
                    )}
                    {!node.description && <div>No Description</div>}
                  </div>
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {showComments && <CommentSection onClose={() => setShowComments(false)} />}
            </AnimatePresence>
            <div
              className={`my-auto ml-6 rotate-180 cursor-pointer rounded-full bg-white p-3 ${
                isInFullscreen ? "hidden" : ""
              }`}
            >
              <IoIosArrowBack size={24} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default NodeModal;
