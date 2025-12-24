"use client";
import { CommentType } from "@/types/commentTypes";
import { useState } from "react";
import { dummyComments } from "../NodeModal";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { HiReply } from "react-icons/hi";

function Comment({
  comment,
  isSubComment,
  onReplyClick = () => {},
}: {
  comment: CommentType;
  isSubComment?: boolean;
  onReplyClick: (comment: CommentType) => void;
}) {
  const [subComments, setSubComments] = useState<CommentType[]>([]);
  const [showReplies, setShowReplies] = useState(false);

  function fetchReplies() {
    // Fetch replies from server based on comment._id
    // For demo purposes, we'll use dummy data
    const replies: CommentType[] = dummyComments.filter(
      (c) => c.parentId === comment._id
    );
    setSubComments(replies);
  }

  return (
    <div className={`flex gap-3 py-3 ${isSubComment ? "pb-0" : ""}`}>
      <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center font-bold">
        {comment.author.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-start items-center mb-0.5">
          <span className="font-semibold text-xs">{comment.author}</span>
          <span className="text-[10px] text-black/40 pl-2 border-l border-black/20 ml-2">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-black/90">{comment.content}</p>
        <div className="flex gap-2">
          <div className="flex mt-1 w-fit rounded-full cursor-pointer">
            <button className="flex gap-1 pr-1.5 border-r border-black/20 text-[10px] items-center cursor-pointer">
              <FiThumbsUp size={12} />
              <span className="mt-0.5">{comment.likesCount || 0}</span>
            </button>
            <button className="flex gap-1 pl-1.5 text-[10px] items-center cursor-pointer">
              <FiThumbsDown size={12} />
            </button>
          </div>
          {comment.replyCount > 0 && (
            <div
              className="text-[10px] font-semibold mt-1 flex items-center cursor-pointer leading-2.5 px-1.5 py-1 rounded-full hover:bg-black/10"
              onClick={() => {
                setShowReplies((val) => !val);
                fetchReplies();
              }}
            >
              {comment.replyCount || 0}&nbsp;<div> replies</div>
            </div>
          )}
          <div className="my-auto cursor-pointer rounded hover:bg-black/10 p-1" onClick={() => onReplyClick(comment)}>
            <HiReply size={12} />
          </div>
        </div>
        {showReplies &&
          subComments.map((subComment) => (
            <Comment
              key={subComment._id}
              comment={subComment}
              isSubComment={true}
              onReplyClick={onReplyClick}
            />
          ))}
      </div>
    </div>
  );
}

export default Comment;
