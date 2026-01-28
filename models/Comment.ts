import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  loreId: string; // The ID of the video / post this belongs to (INDEX THIS)
  parentId: string | null; // null = top-level comment; ID = reply to another comment
  author: string;
  authorProfileImage?: string;
  authorId: string; // Reference to User (Indexed)
  content: string;
  likesCount: number;
  dislikesCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

const CommentSchema: Schema = new Schema(
  {
    loreId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Lore",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Comment",
    },
    author: {
      type: String,
      required: true,
    },
    authorProfileImage: {
      type: String,
      required: false,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "comments",
    timestamps: true,
  }
);

const Comment = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
