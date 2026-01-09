import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Comment from "@/models/comment";
import CommentDislike from "@/models/commentDislike";
import mongoose from "mongoose";

export async function POST(request: NextRequest, { params }: { params: { commentId: string } }) {
  const userId = request.headers.get("x-user");
  const { commentId } = params;

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

    const existingDislike = await CommentDislike.findOne({
      commentId: objectCommentId,
      userId: objectUserId,
    });

    if (existingDislike) {
      // Undislike the comment
      await CommentDislike.deleteOne({ _id: existingDislike._id });
      await Comment.findByIdAndUpdate(objectCommentId, { $inc: { dislikesCount: -1 } });
      return NextResponse.json({ message: "Comment undisliked" }, { status: 200 });
    } else {
      // Dislike the comment
      await CommentDislike.create({ commentId: objectCommentId, userId: objectUserId });
      await Comment.findByIdAndUpdate(objectCommentId, { $inc: { dislikesCount: 1 } });
      return NextResponse.json({ message: "Comment disliked" }, { status: 200 });
    }
  } catch (error) {
    console.error("Failed to toggle comment dislike:", error);
    return NextResponse.json({ error: "Failed to toggle comment dislike" }, { status: 500 });
  }
}
