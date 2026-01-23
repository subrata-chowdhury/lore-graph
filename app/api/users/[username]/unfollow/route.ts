import mongoose from "mongoose";
import dbConnect from "@/config/db";
import { NextResponse } from "next/server";
import Follow from "@/models/Follow";
import User from "@/models/User";

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
    // 1. Find and delete the follow record
    // We use followingUsername because that's what we have from params
    const deletedFollow = await Follow.findOneAndDelete(
      { follower: followerId, followingUsername: username, followerUsername: followerUsername },
      { session }
    ).lean();

    if (!deletedFollow) {
      return NextResponse.json(
        { error: "You are not following this user", success: false },
        { status: 400 }
      );
    }

    const followingId = deletedFollow.following;

    // 2. Decrement counts for both users in a single bulk operation
    await User.bulkWrite(
      [
        {
          updateOne: {
            filter: { _id: followerId },
            update: { $inc: { followingCount: -1 } },
          },
        },
        {
          updateOne: {
            filter: { _id: followingId },
            update: { $inc: { followersCount: -1 } },
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    await session.abortTransaction();
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  } finally {
    session.endSession();
  }
}
