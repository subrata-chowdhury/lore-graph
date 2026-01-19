import mongoose, { Schema, Document } from "mongoose";

export interface ICommentDislike extends Document {
  commentId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const CommentDislikeSchema: Schema = new Schema(
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
    collection: "comment-dislikes",
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Ensure a user can only dislike a specific comment once
CommentDislikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

const CommentDislike =
  mongoose.models.CommentDislike ||
  mongoose.model<ICommentDislike>("CommentDislike", CommentDislikeSchema);

export default CommentDislike;
