import { CommentType } from "@/types/commentTypes";
import { motion } from "framer-motion";
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { dummyComments } from "../NodeModal";

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
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "0" }}
      exit={{ x: "-100%" }}
      className="h-full flex flex-col min-w-[350px] bg-white rounded-r-lg"
    >
      <div className="flex justify-between items-center gap-7 px-4 py-2 border-b border-black/10">
        <h3 className="font-semibold">
          Comments
          {(commentsCount || 0) > 0 && (
            <span className="font-normal text-xs"> ({commentsCount})</span>
          )}
        </h3>
        <CgClose className="cursor-pointer" onClick={onClose} />
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto px-4">
        {comments.length <= 0 && (
          <p className="text-xs my-auto text-black/40 font-medium text-center py-2">
            No Comments
          </p>
        )}
        {comments.map((comment, index) => (
          <Comment key={index} comment={comment} />
        ))}
      </div>
      <InputBox />
    </motion.div>
  );
}

function InputBox({
  onCommentSubmit = () => {},
}: {
  onCommentSubmit?: (comment: string) => void;
}) {
  const [comment, setComment] = useState("");

  return (
    <div className="flex gap-2 items-center px-3 py-4 mt-auto border-t border-black/10 shadow-md">
      <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center font-bold">
        U
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="outline-0 border-b border-black/20 flex-1 resize-x-none text-xs py-1"
      />
      <button
        className="hover:bg-black/10 transition-all text-black rounded-full px-3.5 py-2 cursor-pointer"
        onClick={() => {
          onCommentSubmit(comment);
          setComment("");
        }}
      >
        <IoSend />
      </button>
    </div>
  );
}

function Comment({
  comment,
  isSubComment,
}: {
  comment: CommentType;
  isSubComment?: boolean;
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
            <button className="flex gap-1 pr-1.5 border-r border-black/20 text-[10px] font-semibold items-center cursor-pointer">
              <FiThumbsUp size={12} />
              {comment.likesCount || 0}
            </button>
            <button className="flex gap-1 pl-1.5 text-xs font-semibold items-center cursor-pointer">
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
        </div>
        {showReplies &&
          subComments.map((subComment) => (
            <Comment
              key={subComment._id}
              comment={subComment}
              isSubComment={true}
            />
          ))}
      </div>
    </div>
  );
}
