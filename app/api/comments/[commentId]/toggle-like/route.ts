import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Comment from "@/models/Comment";
import CommentLike from "@/models/CommentLike";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const userId = request.headers.get("x-user");
  const { commentId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return NextResponse.json({ error: "Invalid Comment ID" }, { status: 400 });
  }

  try {
    await dbConnect();

    const objectCommentId = new mongoose.Types.ObjectId(commentId);
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const existingLike = await CommentLike.findOne({
      commentId: objectCommentId,
      userId: objectUserId,
    });

    if (existingLike) {
      // Unlike the comment
      await CommentLike.deleteOne({ _id: existingLike._id });
      await Comment.findByIdAndUpdate(objectCommentId, { $inc: { likesCount: -1 } });
      return NextResponse.json({ message: "Comment unliked" }, { status: 200 });
    } else {
      // Like the comment
      await CommentLike.create({ commentId: objectCommentId, userId: objectUserId });
      await Comment.findByIdAndUpdate(objectCommentId, { $inc: { likesCount: 1 } });
      return NextResponse.json({ message: "Comment liked" }, { status: 200 });
    }
  } catch (error) {
    console.error("Failed to toggle comment like:", error);
    return NextResponse.json({ error: "Failed to toggle comment like" }, { status: 500 });
  }
}
