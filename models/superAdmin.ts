import mongoose, { Schema, Document } from "mongoose";

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  otp?: string;
  otpExpiry?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema: Schema = new Schema(
  {
    name: {
      type: String,
      default: "Super Admin User",
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
    verified: { type: Boolean, default: false },
    otp: { type: String, required: false },
    otpExpiry: { type: Date, required: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    collection: "super-admins",
    timestamps: true,
  }
);

const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model<ISuperAdmin>("SuperAdmin", SuperAdminSchema);

export default SuperAdmin;
