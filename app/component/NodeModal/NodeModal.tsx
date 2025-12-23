"use client";
import Modal from "@/ui/components/Modal";
import { useOpenedNodeContext } from "../../contexts/OpenedNodeContext";
import YouTube, { YouTubePlayer, YouTubeEvent } from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { PiYoutubeLogo } from "react-icons/pi";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { BiFullscreen, BiShare } from "react-icons/bi";
import Link from "next/link";
import { PiShareFatFill } from "react-icons/pi";
import { BsChatSquareText } from "react-icons/bs";
import CommentSection from "./components/CommenSection";
import { AnimatePresence } from "framer-motion";
import { CommentType } from "@/types/commentTypes";

const NodeModal = () => {
  const { node, setNode } = useOpenedNodeContext();
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentPageniation, setCommentPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    limit: 100,
  });
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

  const onReady = (event: YouTubeEvent) => {
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

  useEffect(() => {
    setComments(dummyComments);
  }, []);

  return (
    <>
      {node && (
        <Modal onClose={() => setNode(null)} className="bg-transparent!">
          <div
            className={`flex max-h-[85vh] h-[85vh] max-w-[90vw] transition-all`}
          >
            <div className="flex flex-1 flex-col overflow-y-auto scrollbar-hide z-5 bg-white">
              {node.type === "youtube" && (
                <YouTube
                  videoId={node.src}
                  opts={opts}
                  onReady={onReady}
                  onStateChange={onStateChange}
                  className={
                    "rounded-t-md aspect-video w-[640px] h-[390px]" +
                    (loading ? " hidden" : "") +
                    (showComments ? " rounded-r-md" : "")
                  }
                />
              )}
              {loading && (
                <div className="w-[640px] h-[390px] bg-black/10 flex items-center justify-center animate-pulse">
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
                    <PiShareFatFill />
                  </button>
                  <button
                    className="p-2 bg-black/10 rounded-lg cursor-pointer hover:bg-black/20 transition-colors"
                    onClick={() => {
                      const btn: HTMLButtonElement | null = window.document.querySelector(".ytp-fullscreen-button.ytp-button")
                      console.log(btn)
                      btn?.click();
                    }}
                  >
                    <BiFullscreen />
                  </button>
                </div>
                <div className="p-2 px-3 bg-black/10 rounded-lg text-sm">
                  <div className="flex font-semibold gap-2">
                    <div>{node.viewsCount || 0} views</div>
                    <div>
                      {new Date(node.updatedAt || "").toLocaleDateString() ||
                        ""}
                    </div>
                  </div>
                  <div className=" wrap-break-word whitespace-pre-wrap">
                    {node.description || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {showComments && (
                <CommentSection
                  comments={comments}
                  onCommentSubmit={(newComment) =>
                    setComments([...comments, newComment])
                  }
                  commentsCount={1200}
                  onClose={() => setShowComments(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </Modal>
      )}
    </>
  );
};

export default NodeModal;

export const dummyComments: CommentType[] = [
  {
    _id: "1",
    author: "User1",
    content: "This is a great video!",
    createdAt: new Date().toISOString(),
    nodeId: "node1",
    parentId: null,
    likesCount: 10,
    replyCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    author: "User2",
    content: "I learned a lot from this video.",
    createdAt: new Date().toISOString(),
    nodeId: "node1",
    parentId: null,
    likesCount: 5,
    replyCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "3",
    author: "User3",
    content: "I learned a lot from this video.",
    createdAt: new Date().toISOString(),
    nodeId: "node1",
    parentId: "2",
    likesCount: 5,
    replyCount: 0,
    updatedAt: new Date().toISOString(),
  },
];
