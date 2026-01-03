import { CommentType } from "@/types/commentTypes";
import Title from "@/ui/components/Title";
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoSend } from "react-icons/io5";
import Comment from "./Comment";

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
      className={`flex items-center gap-2 px-3 ${
        replyData ? "py-2" : "py-4"
      } mt-auto border-t border-black/10 shadow-md`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 font-bold">
        U
      </div>
      <div className="flex flex-1 flex-col">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-x-none flex-1 rounded border-b border-black/20 bg-black/5 px-1 py-1 text-xs outline-0"
        />
        {replyData && (
          <div className="mt-1 flex w-full items-center gap-1 text-[10px]">
            Reply to:
            <span className="rounded bg-black/10 px-1 py-0.5">{replyData.author}</span>
            <CgClose className="ml-1 cursor-pointer" onClick={onCancelReply} />
          </div>
        )}
      </div>
      <Title
        className="right-0 border border-black/10 [&>*:last-child]:left-full [&>*:last-child]:-translate-x-7"
        title={
          comment.length > 0 ? (
            <>
              <p>Demo: </p>
              <Comment
                className=""
                onReplyClick={() => {}}
                comment={{
                  _id: "fake_id",
                  content: comment.length > 40 ? comment.slice(0, 40) + "..." : comment,
                  nodeId: "fake_node_id",
                  likesCount: 0,
                  replyCount: 0,
                  parentId: replyData ? replyData._id : "fake_node_id",
                  author: "current_user",
                  authorId: "current_user_id",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }}
              />
            </>
          ) : (
            "Send Comment"
          )
        }
      >
        <button
          className="cursor-pointer rounded-full px-3.5 py-2.5 text-black transition-all hover:bg-black/10"
          onClick={() => {
            onCommentSubmit(comment);
            setComment("");
          }}
        >
          <IoSend />
        </button>
      </Title>
    </div>
  );
}

export default InputBox;
