"use client";
import { CommentType } from "@/types/commentTypes";
import { motion } from "framer-motion";
import { CgClose } from "react-icons/cg";
import numberFormatter from "@/libs/numberFormatter";
import Comment from "./Comment";
import InputBox from "./InputBox";
import { useState } from "react";

type Props = {
  comments: CommentType[];
  onCommentSubmit?: (comment: CommentType) => void;
  commentsCount?: number;
  onClose?: () => void;
};

export default function CommentSection({
  comments = [],
  onCommentSubmit = () => {},
  commentsCount = 0,
  onClose = () => {},
}: Props) {
  const [replyCommentData, setReplyCommentData] = useState<CommentType | null>(null);

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "0" }}
      exit={{ x: "-100%" }}
      className="h-full flex flex-col min-w-[350px] bg-white rounded-r-lg"
    >
      <div className="flex justify-between items-center gap-7 px-4 py-2.5 border-b border-black/10">
        <h3 className="font-semibold">
          Comments
          {(commentsCount || 0) > 0 && (
            <span className="font-normal text-xs"> ({numberFormatter(commentsCount)})</span>
          )}
        </h3>
        <CgClose className="cursor-pointer" onClick={onClose} />
      </div>
      <div className="flex-1 flex flex-col max-w-87.5 lg:max-w-137.5 overflow-auto px-4">
        {comments.length <= 0 && (
          <p className="text-xs my-auto text-black/40 font-medium text-center py-2">
            No Comments
          </p>
        )}
        {comments.map((comment, index) => (
          <Comment key={index} comment={comment} onReplyClick={setReplyCommentData} />
        ))}
      </div>
      <InputBox replyData={replyCommentData} onCancelReply={() => setReplyCommentData(null)} />
    </motion.div>
  );
}