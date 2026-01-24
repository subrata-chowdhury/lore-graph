"use client";
import { CommentType } from "@/types/commentTypes";
import { motion } from "framer-motion";
import { CgClose } from "react-icons/cg";
import numberFormatter from "@/libs/numberFormatter";
import Comment from "./Comment";
import InputBox from "./InputBox";
import { useEffect, useState } from "react";
import { useOpenedLoreContext } from "@/contexts/OpenedLoreContext";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "react-toastify";
import fetcher from "@/libs/fetcher";

type Props = {
  onClose?: () => void;
};

export default function CommentSection({ onClose = () => {} }: Props) {
  const [replyCommentData, setReplyCommentData] = useState<
    (CommentType & { isLiked: boolean; isDisliked: boolean }) | null
  >(null);
  const [comments, setComments] = useState<
    (CommentType & { isLiked: boolean; isDisliked: boolean })[]
  >([]);
  const [commentPageniation, setCommentPagination] = useState({
    page: 0,
    pageSize: 0,
    total: 0,
    limit: 10,
    totalCommentsIncludeingReply: 0,
  });
  const { lore } = useOpenedLoreContext();
  const socket = useSocket();
  const [loading, setLoading] = useState(false);

  async function postComment(commentData: {
    content: string;
    loreId: string;
    parentId: string | null;
  }) {
    const res = await fetcher.post("/comments", commentData);
    if (res.status !== 201) {
      toast.error(res.error || "Failed to post comment");
    }
  }

  useEffect(() => {
    if (lore?._id) {
      fetchComments(1);
    }
  }, [lore?._id]);

  async function fetchComments(page = 1) {
    if (!lore?._id) return;
    setLoading(true);
    const res = await fetcher.get<{
      data: (CommentType & { isLiked: boolean; isDisliked: boolean })[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        limit: number;
        totalCommentsIncludeingReply: number;
      };
    }>(`/comments?loreId=${lore._id}&page=${page}&limit=${commentPageniation.limit}`);
    setLoading(false);
    if (res.status === 200 && res.body) {
      if (page === 1) {
        setComments(res.body.data);
      } else {
        setComments((prev) => [...prev, ...(res.body?.data || [])]);
      }
      setCommentPagination((prev) => ({
        ...prev,
        total: res.body?.pagination.total || 0,
        page: res.body?.pagination.page || 0,
        totalCommentsIncludeingReply: res.body?.pagination.totalCommentsIncludeingReply || 0,
      }));
    } else {
      toast.error(res.error || "Failed to fetch comments");
    }
  }

  useEffect(() => {
    if (!socket || !lore?._id) return;

    const handleNewComment = (
      newComment: CommentType & { isLiked: boolean; isDisliked: boolean }
    ) => {
      if (newComment.loreId === lore._id) {
        // Update total count in header
        setCommentPagination((prev) => ({ ...prev, total: prev.total + 1 }));

        const isTopLevel = !newComment.parentId || newComment.parentId === lore._id;
        if (isTopLevel) {
          // Add to top-level comments list
          setComments((prevComments) => [newComment, ...prevComments]);
        } else {
          // Increment reply count for the parent comment if it's in the current list
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment._id === newComment.parentId
                ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
                : comment
            )
          );
        }
      }
    };

    socket.on("new-comment", handleNewComment);
    return () => {
      socket.off("new-comment", handleNewComment);
    };
  }, [socket, lore]);

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "0" }}
      exit={{ x: "-100%" }}
      className="absolute left-0 z-10 flex h-full w-full min-w-87.5 flex-col rounded-lg bg-white lg:static lg:z-auto lg:w-auto lg:rounded-l-none"
    >
      <div className="flex items-center justify-between gap-7 border-b border-black/10 px-4 py-2.5">
        <h3 className="font-semibold">
          Comments
          {(commentPageniation.total || 0) > 0 && (
            <span className="text-xs font-normal">
              {" "}
              ({numberFormatter(commentPageniation.totalCommentsIncludeingReply)})
            </span>
          )}
        </h3>
        <CgClose className="cursor-pointer" onClick={onClose} />
      </div>
      <div className="flex flex-1 flex-col overflow-auto px-4 lg:max-w-137.5">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-b-transparent"></div>
          </div>
        )}
        {comments.length <= 0 && !loading && (
          <p className="my-auto py-2 text-center text-xs font-medium text-black/40">No Comments</p>
        )}
        {comments.map((comment) => (
          <Comment key={comment._id} comment={comment} onReplyClick={setReplyCommentData} />
        ))}
      </div>
      {socket && (
        <InputBox
          replyData={replyCommentData}
          onCancelReply={() => setReplyCommentData(null)}
          onCommentSubmit={(comment) => {
            if (!lore) return;
            postComment({
              content: comment,
              loreId: lore._id,
              parentId: replyCommentData?._id || null,
            });
            setReplyCommentData(null);
          }}
        />
      )}
    </motion.div>
  );
}
