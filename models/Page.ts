import mongoose, { Schema, Document } from "mongoose";

export interface IPage extends Document {
  title: string;
  lvls: { id: string; title: string }[];
  slug: string;
  description: string;
  tags: string[];
  authorId: string;
  authorUsername: string;
  rating: number;
  rated: number;
  likes: number;
  views: number;
  bgImgUrl?: string;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    lvls: [
      {
        _id: false,
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
        title: { type: String },
      },
    ],
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    authorId: {
      type: String,
      required: true,
    },
    authorUsername: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    rated: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    bgImgUrl: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  {
    collection: "pages",
    timestamps: true,
  }
);

const Page = mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default Page;
