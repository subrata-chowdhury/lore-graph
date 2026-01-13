"use client";
import { CommentType } from "@/types/commentTypes";
import { useState } from "react";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { HiReply } from "react-icons/hi";
import fetcher from "@/libs/fetcher";
import { toast } from "react-toastify";
import Link from "next/link";

function Comment({
  comment,
  className,
  isSubComment,
  onReplyClick = () => {},
}: {
  comment: CommentType;
  className?: string;
  isSubComment?: boolean;
  onReplyClick: (comment: CommentType) => void;
}) {
  const [subComments, setSubComments] = useState<CommentType[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [expandComment, setExpandComment] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  async function fetchReplies() {
    setLoadingReplies(true);
    const res = await fetcher.get<{ data: CommentType[] }>(
      `/comments?loreId=${comment.loreId}&parentId=${comment._id}`
    );
    setLoadingReplies(false);
    if (res.status === 200 && res.body) {
      setSubComments(res.body.data);
    } else {
      toast.error(res.error || "Failed to fetch replies");
    }
  }

  return (
    <div className={`flex gap-3 py-3 ${isSubComment ? "pb-0" : ""} ${className || ""}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 font-bold">
        {comment.author.charAt(0).toUpperCase()}
      </div>
      <div className="flex max-w-68 flex-1 flex-col">
        <div className="mb-0.5 flex items-center justify-start">
          <Link href={`/@${comment.author}`} target="_blank" className="text-xs font-semibold">
            {comment.author}
          </Link>
          <span className="ml-2 border-l border-black/20 pl-2 text-[10px] text-black/40">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="max-w-[95%] text-xs wrap-break-word whitespace-pre-wrap text-black/90">
          {expandComment
            ? comment.content
            : comment.content.split("\n").length > 2 || comment.content.length > 100
              ? comment.content.split("\n").slice(0, 2).join("\n").slice(0, 100) + "..."
              : comment.content}
          {(comment.content.split("\n").length > 2 || comment.content.length > 100) && (
            <span
              className="ml-2 cursor-pointer text-[11px] font-semibold text-black"
              onClick={() => setExpandComment((val) => !val)}
            >
              {expandComment ? "Show Less" : "Show More"}
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <div className="mt-1 flex w-fit cursor-pointer rounded-full">
            <button className="flex cursor-pointer items-center gap-1 border-r border-black/20 pr-1.5 text-[10px]">
              <FiThumbsUp size={12} />
              <span className="mt-0.5">{comment.likesCount || 0}</span>
            </button>
            <button className="flex cursor-pointer items-center gap-1 pl-1.5 text-[10px]">
              <FiThumbsDown size={12} />
            </button>
          </div>
          {comment.replyCount > 0 && (
            <div
              className="mt-1 flex cursor-pointer items-center rounded-full px-1.5 py-1 text-[10px] leading-2.5 font-semibold hover:bg-black/10"
              onClick={() => {
                if (subComments.length === 0) {
                  fetchReplies();
                }
                setShowReplies((val) => !val);
              }}
            >
              {comment.replyCount || 0}&nbsp;<div> replies</div>
            </div>
          )}
          <div
            className="my-auto cursor-pointer rounded p-1 hover:bg-black/10"
            onClick={() => onReplyClick(comment)}
          >
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
