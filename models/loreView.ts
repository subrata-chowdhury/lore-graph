import mongoose, { Schema, Document } from "mongoose";

export interface ILoreView extends Document {
  loreId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const LoreViewSchema: Schema = new Schema(
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
      required: false,
      default: null,
      index: true,
    },
  },
  {
    collection: "lore-views",
    timestamps: true,
  }
);

const LoreView = mongoose.models.LoreView || mongoose.model<ILoreView>("LoreView", LoreViewSchema);

export default LoreView;
