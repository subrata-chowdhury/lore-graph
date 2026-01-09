import mongoose, { Schema, Document } from "mongoose";

export interface ILoreDislike extends Document {
  loreId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoreDislikeSchema: Schema = new Schema(
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
    collection: "lore-dislikes",
    timestamps: true,
  }
);

// Ensure a user can only dislike a lore once
LoreDislikeSchema.index({ loreId: 1, userId: 1 }, { unique: true });

const LoreDislike =
  mongoose.models.LoreDislike || mongoose.model<ILoreDislike>("LoreDislike", LoreDislikeSchema);

export default LoreDislike;
