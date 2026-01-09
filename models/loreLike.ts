import mongoose, { Schema, Document } from "mongoose";

export interface ILoreLike extends Document {
  loreId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoreLikeSchema: Schema = new Schema(
  {
    loreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lore",
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
    collection: "lore-likes",
    timestamps: true,
  }
);

// Ensure a user can only like a lore once
LoreLikeSchema.index({ loreId: 1, userId: 1 }, { unique: true });

const LoreLike = mongoose.models.LoreLike || mongoose.model<ILoreLike>("LoreLike", LoreLikeSchema);

export default LoreLike;
