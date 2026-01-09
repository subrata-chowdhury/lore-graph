import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Comment, { IComment } from "@/models/comment";
import { Filter } from "bad-words";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const loreId = searchParams.get("loreId");
  const parentId = searchParams.get("parentId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (!loreId) {
    return NextResponse.json({ error: "loreId is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    const query: { loreId: string; parentId?: string | null } = { loreId };

    // Fetching top-level comments for a lore with pagination
    query.parentId = parentId || null;
    const skip = (page - 1) * limit;

    const comments = await Comment.find(query).skip(skip).limit(limit).lean();

    const total = await Comment.countDocuments(query);

    // total count includeing reply counts
    const totalCommentsIncludeingReply = await Comment.countDocuments({ loreId: loreId });

    const pagination = {
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
      totalCommentsIncludeingReply,
    };

    return NextResponse.json({ data: comments, pagination });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authorId = request.headers.get("x-user");
  const authorUsername = request.headers.get("x-username");

  if (!authorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { content, loreId, parentId } = body;

    if (!content || !loreId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // bad word finder
    const filter = new Filter();
    if (filter.isProfane(content)) {
      return NextResponse.json({ error: "Content contains profanity." }, { status: 400 });
    }

    const newComment = new Comment({
      content,
      loreId,
      parentId: parentId || null,
      author: authorUsername,
      authorId,
    });

    await newComment.save();

    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
    }

    // The client-side socket listener expects a new comment.
    // The API route needs a way to access the socket.io server instance.
    const io = (global as any).io;
    if (io) {
      io.to(loreId).emit("new-comment", newComment.toObject());
    } else {
      console.warn("Socket.io server not found. Real-time updates will not be sent.");
    }

    return NextResponse.json({ data: newComment.toObject() }, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
