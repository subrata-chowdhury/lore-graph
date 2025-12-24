import { CommentType } from "@/types/commentTypes";
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoSend } from "react-icons/io5";

function InputBox({
  replyData,
  onCancelReply,
  onCommentSubmit = () => {},
}: {
  replyData?: CommentType | null;
  onCancelReply?: () => void;
  onCommentSubmit?: (comment: string) => void;
}) {
  const [comment, setComment] = useState("");

  return (
    <div
      className={`flex gap-2 items-center px-3 ${
        replyData ? "py-2" : "py-4"
      } mt-auto border-t border-black/10 shadow-md`}
    >
      <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center font-bold">
        U
      </div>
      <div className="flex flex-1 flex-col">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="outline-0 border-b border-black/20 bg-black/5 rounded px-1 flex-1 resize-x-none text-xs py-1"
        />
        {replyData && (
          <div className="text-[10px] mt-1 w-full items-center flex gap-1">
            Reply to:
            <span className="px-1 py-0.5 bg-black/10 rounded">
              {replyData.author}
            </span>
            <CgClose className="ml-1 cursor-pointer" onClick={onCancelReply} />
          </div>
        )}
      </div>
      <button
        className="hover:bg-black/10 transition-all text-black rounded-full px-3.5 py-2.5 cursor-pointer"
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

export default InputBox;
