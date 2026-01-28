import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Comment, { IComment } from "@/models/Comment";
import CommentLike from "@/models/CommentLike";
import CommentDislike from "@/models/CommentDislike";
import { Filter } from "bad-words";
import mongoose from "mongoose";
import Lore from "@/models/Lore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const loreId = searchParams.get("loreId");
  const parentId = searchParams.get("parentId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const userId = request.headers.get("x-user");

  if (!loreId) {
    return NextResponse.json({ error: "loreId is required" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(loreId)) {
    return NextResponse.json({ error: "Invalid loreId" }, { status: 400 });
  }

  if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
    return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
  }

  try {
    await dbConnect();

    const objectLoreId = new mongoose.Types.ObjectId(loreId);
    const objectParentId = parentId ? new mongoose.Types.ObjectId(parentId) : null;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $facet: {
          comments: [
            { $match: { loreId: objectLoreId, parentId: objectParentId } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            ...(userId
              ? [
                  {
                    $lookup: {
                      from: CommentLike.collection.name,
                      let: { commentId: "$_id" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$commentId", "$$commentId"] },
                                { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                              ],
                            },
                          },
                        },
                      ],
                      as: "userLike",
                    },
                  },
                  {
                    $lookup: {
                      from: CommentDislike.collection.name,
                      let: { commentId: "$_id" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$commentId", "$$commentId"] },
                                { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                              ],
                            },
                          },
                        },
                      ],
                      as: "userDislike",
                    },
                  },
                  {
                    $addFields: {
                      isLiked: { $gt: [{ $size: "$userLike" }, 0] },
                      isDisliked: { $gt: [{ $size: "$userDislike" }, 0] },
                    },
                  },
                  { $project: { userLike: 0, userDislike: 0 } },
                ]
              : [{ $addFields: { isLiked: false, isDisliked: false } }]),
          ],
          totalCount: [
            { $match: { loreId: objectLoreId, parentId: objectParentId } },
            { $count: "count" },
          ],
          totalCommentsIncludeingReply: [{ $match: { loreId: objectLoreId } }, { $count: "count" }],
        },
      },
    ];

    const result = await Comment.aggregate(pipeline);
    const commentsWithInteraction = result[0].comments;
    const total = result[0].totalCount[0]?.count || 0;
    const totalCommentsIncludeingReply = result[0].totalCommentsIncludeingReply[0]?.count || 0;

    const pagination = {
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
      totalCommentsIncludeingReply,
    };

    return NextResponse.json({ data: commentsWithInteraction, pagination });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authorId = request.headers.get("x-user");
  const authorUsername = request.headers.get("x-username");
  const authorProfileImage = request.headers.get("x-profile-image");

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

    const lore = await Lore.findById(loreId);
    if (!lore) {
      return NextResponse.json({ error: "Lore not found" }, { status: 404 });
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
      authorProfileImage,
    });
    lore.commentsCount++;
    await lore.save();

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
