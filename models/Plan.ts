import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
  plan: "free" | "premium" | "ultra-premium";
  usage: {
    youtubeApi: {
      count: number;
      lastReset: Date;
    };
    pageCreation: {
      count: number;
    };
  };
  extraCredits: {
    youtubeApi: number;
    pageCreation: number;
  };
  username: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema: Schema = new Schema(
  {
    plan: {
      type: String,
      enum: ["free", "premium", "ultra-premium"],
      default: "free",
    },

    // 1. TRACKING USAGE (What have they consumed?)
    usage: {
      youtubeApi: {
        count: { type: Number, default: 0 },
        lastReset: { type: Date, default: Date.now }, // For daily resets
      },
      pageCreation: {
        count: { type: Number, default: 0 }, // No date needed for lifetime
      },
    },

    // 2. EXTRA CREDITS (Top-ups)
    // These are purchased buffers that sit on top of the plan limits
    extraCredits: {
      youtubeApi: { type: Number, default: 0 },
      pageCreation: { type: Number, default: 0 },
    },
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    collection: "plans",
    timestamps: true,
  }
);

const Plan = mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);

export default Plan;
