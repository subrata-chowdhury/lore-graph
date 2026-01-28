import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  username: string;
  profileImage?: string;
  bannerImage?: string;
  country?: string;
  followersCount: number;
  followingCount: number;
  about?: string;
  links?: {
    type: "YouTube" | "Twittch" | "Instagram" | "TikTok" | "X" | "Facebook" | "Other";
    url: string;
  }[];

  verified: boolean;
  otp?: string;
  otpExpiry?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: { type: String, required: false },
    bannerImage: { type: String, required: false },
    about: { type: String, required: false },
    links: {
      type: [
        {
          type: {
            type: String,
            enum: ["YouTube", "Twittch", "Instagram", "TikTok", "X", "Facebook", "Other"],
            required: true,
          },
          url: { type: String, required: true },
        },
      ],
      default: [],
    },
    country: { type: String, required: false },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    otp: { type: String, required: false },
    otpExpiry: { type: Date, required: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
