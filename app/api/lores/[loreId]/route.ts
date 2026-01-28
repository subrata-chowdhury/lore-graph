import mongoose from "mongoose";
import dbConnect from "@/config/db";
import Comment from "@/models/Comment";
import CommentDislike from "@/models/CommentDislike";
import CommentLike from "@/models/CommentLike";
import Lore from "@/models/Lore";
import LoreDislike from "@/models/LoreDislike";
import LoreLike from "@/models/LoreLike";
import LoreView from "@/models/LoreView";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loreId: string }> }
) {
  try {
    await dbConnect();
    const { loreId } = await params;

    const lore = await Lore.findOne({ _id: loreId, visibility: "public" });

    if (!lore) {
      return NextResponse.json({ error: "Lore not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: lore });
  } catch (error) {
    console.error("Error fetching lore:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ loreId: string }> }) {
  try {
    await dbConnect();

    const { loreId } = await params;
    const body = await req.json();
    const { title, description, tags, type, src, thumbnailUrl, visibility, _id } = body;

    if (!loreId || !_id || !body) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }
    if (loreId !== _id) {
      return NextResponse.json(
        { message: "Lore ID in path and body do not match" },
        { status: 400 }
      );
    }

    const authorId = req.headers.get("x-user");

    if (!authorId) {
      return NextResponse.json({ message: "Author ID is required" }, { status: 400 });
    }

    if (!title || !type) {
      return NextResponse.json({ message: "Title and type are required" }, { status: 400 });
    }

    const updatedLore = await Lore.findOneAndUpdate(
      { _id: _id, createdById: authorId },
      {
        title,
        description,
        tags: tags || [],
        type,
        src,
        thumbnailUrl,
        visibility: visibility || "private",
      },
      { new: true }
    );

    if (!updatedLore) {
      return NextResponse.json({ message: "Lore not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedLore }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating lore:", error);
    return NextResponse.json(
      { message: "Error updating lore", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ loreId: string }> }) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { loreId } = await params;
    const authorId = req.headers.get("x-user");

    if (!authorId) {
      await session.abortTransaction();
      return NextResponse.json({ message: "Author ID is required" }, { status: 400 });
    }
    if (!loreId) {
      await session.abortTransaction();
      return NextResponse.json({ message: "Lore ID is required" }, { status: 400 });
    }

    const deletedLore = await Lore.findOneAndDelete(
      { _id: loreId, createdById: authorId },
      { session }
    );

    if (!deletedLore) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          message: "Lore not found or unauthorized",
          success: false,
        },
        { status: 404 }
      );
    }

    // Efficiently fetch only the IDs of the comments to be deleted
    const commentIds = await Comment.find({ loreId: deletedLore._id })
      .session(session)
      .distinct("_id");

    // Parallelize deletions of all associated data
    await Promise.all([
      commentIds.length > 0
        ? CommentLike.deleteMany({ commentId: { $in: commentIds } }, { session })
        : Promise.resolve(),
      commentIds.length > 0
        ? CommentDislike.deleteMany({ commentId: { $in: commentIds } }, { session })
        : Promise.resolve(),
      Comment.deleteMany({ loreId: deletedLore._id }, { session }),
      LoreView.deleteMany({ loreId: deletedLore._id }, { session }),
      LoreLike.deleteMany({ loreId: deletedLore._id }, { session }),
      LoreDislike.deleteMany({ loreId: deletedLore._id }, { session }),
    ]);

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Lore deleted successfully",
        success: true,
        data: deletedLore,
      },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting lore:", error);
    return NextResponse.json(
      { message: "Error deleting lore", error, success: false },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
