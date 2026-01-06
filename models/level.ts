import mongoose, { Schema, Document } from "mongoose";

export interface ILevel extends Document {
  levels: { _id: string; next: string[] }[][];
  name: string;
  type: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

const LevelSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    levels: {
      type: [
        [
          {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "Lore" },
            next: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lore" }],
          },
        ],
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    collection: "levels",
    timestamps: true,
  }
);

const Level = mongoose.models.Level || mongoose.model<ILevel>("Level", LevelSchema);

export default Level;
