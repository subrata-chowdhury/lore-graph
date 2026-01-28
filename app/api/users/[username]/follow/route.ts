import mongoose from "mongoose";
import Follow from "@/models/Follow";
import User from "@/models/User";
import dbConnect from "@/config/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  await dbConnect();
  const followerId = request.headers.get("x-user");
  const followerUsername = request.headers.get("x-username");

  if (!followerId) {
    return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch follower and following details for denormalization
    const users = await User.find({
      $or: [{ _id: followerId }, { username: username }],
    })
      .session(session)
      .select("name username")
      .lean();

    const followerUser = users.find((u) => u._id.toString() === followerId);
    const followingUser = users.find((u) => u.username === username);

    if (!followerUser || !followingUser) {
      throw new Error("User not found");
    }

    const followingId = followingUser._id.toString();

    // 1. Check if trying to follow self
    if (followerId === followingId) {
      return NextResponse.json(
        { error: "You cannot follow yourself", success: false },
        { status: 400 }
      );
    }

    if (followerUser.username !== followerUsername) {
      return NextResponse.json(
        { error: "You cannot follow other users", success: false },
        { status: 400 }
      );
    }

    // 2. Create the Follow Document
    // If this fails (duplicate), the catch block handles it
    await Follow.create(
      [
        {
          follower: followerId,
          following: followingId,
          followerName: followerUser.name,
          followerUsername: followerUser.username,
          followingName: followingUser.name,
          followingUsername: followingUser.username,
          followerProfileImage: followerUser.profileImage,
          followingProfileImage: followingUser.profileImage,
        },
      ],
      { session }
    );

    // 3. Increment counts for both users in a single bulk operation
    await User.bulkWrite(
      [
        {
          updateOne: {
            filter: { _id: followerId },
            update: { $inc: { followingCount: 1 } },
          },
        },
        {
          updateOne: {
            filter: { _id: followingId },
            update: { $inc: { followersCount: 1 } },
          },
        },
      ],
      { session }
    );

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
