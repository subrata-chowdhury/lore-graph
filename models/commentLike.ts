import mongoose, { Schema, Document } from "mongoose";

export interface ICommentLike extends Document {
  commentId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const CommentLikeSchema: Schema = new Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    collection: "comment-likes",
    // We only need createdAt for likes based on the CommentLikeType definition
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Ensure a user can only like a specific comment once
CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

const CommentLike =
  mongoose.models.CommentLike || mongoose.model<ICommentLike>("CommentLike", CommentLikeSchema);

export default CommentLike;
