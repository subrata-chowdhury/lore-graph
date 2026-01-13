import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId; // WHO is following
  following: mongoose.Types.ObjectId; // WHO is being followed
  createdAt: Date;
}

const FollowSchema: Schema<IFollow> = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Faster queries to find "Who is X following?"
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Faster queries to find "Who follows Y?"
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // We only need createdAt
);

// COMPOUND INDEX (Crucial!)
// 1. Prevents duplicate follows (User A cannot follow User B twice).
// 2. Optimizes lookups for specific relationships.
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow: Model<IFollow> =
  mongoose.models.Follow || mongoose.model<IFollow>("Follow", FollowSchema);
export default Follow;
