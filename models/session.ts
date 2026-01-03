import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  user: mongoose.Schema.Types.ObjectId;
  agent: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agent: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: "sessions",
    timestamps: true,
  }
);

const Session =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;
