import mongoose, { Schema, Document } from "mongoose";

export interface INode extends Document {
  src?: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  tags: string[];
  type: "video" | "youtube" | "post";
  viewsCount: number;
  likesCount: number;
  visibility: "public" | "private";
  createdBy: string; // User's name
  createdById: mongoose.Schema.Types.ObjectId; // Reference to User ID (Indexed)
  createdAt: Date;
  updatedAt: Date;
}

const NodeSchema: Schema = new Schema(
  {
    src: {
      type: String,
      required: false,
      maxlength: 150,
    },
    thumbnailUrl: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: ["video", "youtube", "post"],
      required: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    createdBy: {
      // User's name
      type: String,
      required: true,
    },
    createdById: {
      // Reference to User ID
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
  },
  {
    collection: "nodes",
    timestamps: true,
  }
);

// Add text index for searching
NodeSchema.index({ title: "text", description: "text", tags: "text" });

const Node = mongoose.models.Node || mongoose.model<INode>("Node", NodeSchema);

export default Node;
