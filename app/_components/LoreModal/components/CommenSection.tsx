"use client";
import { CommentType } from "@/types/commentTypes";
import { motion } from "framer-motion";
import { CgClose } from "react-icons/cg";
import numberFormatter from "@/libs/numberFormatter";
import Comment from "./Comment";
import InputBox from "./InputBox";
import { useEffect, useState } from "react";
import { useOpenedLoreContext } from "@/app/contexts/OpenedLoreContext";
import { useSocket } from "@/app/contexts/SocketContext";
import { toast } from "react-toastify";

type Props = {
  onClose?: () => void;
};

export default function CommentSection({ onClose = () => {} }: Props) {
  const [replyCommentData, setReplyCommentData] = useState<CommentType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentPageniation, setCommentPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 1200,
    limit: 100,
  });
  const { lore } = useOpenedLoreContext();
  const socket = useSocket();

  function socketCleanup() {
    socket?.off("new-comment");
  }

  function checkForNewComments() {
    socket?.on("new-comment", (newComment: CommentType) => {
      if (newComment.loreId === lore?._id) {
        setComments((prevComments) => [newComment, ...prevComments]);
      }
    });
  }

  function postComment(commentData: CommentType) {
    socket?.emit("send-comment", commentData);
  }

  useEffect(() => {
    setComments(dummyComments);
  }, []);

  useEffect(() => {
    if (!socket || !lore) return;
    checkForNewComments();
    return () => socketCleanup();
  }, [socket, lore]);

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "0" }}
      exit={{ x: "-100%" }}
      className="flex h-full min-w-87.5 flex-col rounded-r-lg bg-white"
    >
      <div className="flex items-center justify-between gap-7 border-b border-black/10 px-4 py-2.5">
        <h3 className="font-semibold">
          Comments
          {(commentPageniation.total || 0) > 0 && (
            <span className="text-xs font-normal">
              {" "}
              ({numberFormatter(commentPageniation.total)})
            </span>
          )}
        </h3>
        <CgClose className="cursor-pointer" onClick={onClose} />
      </div>
      <div className="flex max-w-87.5 flex-1 flex-col overflow-auto px-4 lg:max-w-137.5">
        {comments.length <= 0 && (
          <p className="my-auto py-2 text-center text-xs font-medium text-black/40">No Comments</p>
        )}
        {comments.map((comment, index) => (
          <Comment key={index} comment={comment} onReplyClick={setReplyCommentData} />
        ))}
      </div>
      {socket && (
        <InputBox
          replyData={replyCommentData}
          onCancelReply={() => setReplyCommentData(null)}
          onCommentSubmit={(comment) => {
            if (!lore) return;
            const newComment: CommentType = {
              _id: Math.random().toString(36).substring(2, 9),
              author: "CurrentUser", // Replace with actual user data
              authorId: "currentUserId", // Replace with actual user ID
              content: comment,
              createdAt: new Date().toISOString(),
              loreId: lore._id,
              parentId: replyCommentData?._id || null,
              likesCount: 0,
              replyCount: 0,
              updatedAt: new Date().toISOString(),
            };
            postComment(newComment);
            setReplyCommentData(null);
          }}
        />
      )}
    </motion.div>
  );
}

export const dummyComments: CommentType[] = [
  {
    _id: "1",
    author: "User1",
    authorId: "user1",
    content: "This is a great video!",
    createdAt: new Date().toISOString(),
    loreId: "lore1",
    parentId: null,
    likesCount: 10,
    replyCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    author: "User2",
    authorId: "user2",
    content: "I learned a lot from this video.",
    createdAt: new Date().toISOString(),
    loreId: "lore1",
    parentId: null,
    likesCount: 5,
    replyCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "3",
    author: "User3",
    authorId: "user3",
    content: "I learned a lot from this video.",
    createdAt: new Date().toISOString(),
    loreId: "lore1",
    parentId: "2",
    likesCount: 5,
    replyCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "4",
    author: "User4",
    authorId: "user4",
    content: "I learned a lot from this video.",
    createdAt: new Date().toISOString(),
    loreId: "lore1",
    parentId: "4",
    likesCount: 5,
    replyCount: 1,
    updatedAt: new Date().toISOString(),
  },
];
