import mongoose from "mongoose";
import Follow from "@/models/Follow";
import User from "@/models/User";
import dbConnect from "@/config/db";
import { NextResponse } from "next/server";

async function POST(request: Request, { params }: { params: Promise<{ followingId: string }> }) {
  const { followingId } = await params;
  await dbConnect();
  const followerId = request.headers.get("x-user");

  if (!followerId) {
    return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check if trying to follow self
    if (followerId === followingId) {
      return NextResponse.json(
        { error: "You cannot follow yourself", success: false },
        { status: 400 }
      );
    }

    // 2. Create the Follow Document
    // If this fails (duplicate), the catch block handles it
    await Follow.create([{ follower: followerId, following: followingId }], { session });

    // 3. Increment 'followingCount' for the Follower (User A)
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }, { session });

    // 4. Increment 'followersCount' for the Target (User B)
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } }, { session });

    await session.commitTransaction();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    await session.abortTransaction();

    // Check for duplicate key error (code 11000)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You are already following this user.", success: false },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  } finally {
    session.endSession();
  }
}
