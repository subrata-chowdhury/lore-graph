import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import LoreLike from "@/models/LoreLike";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loreId: string }> }
) {
  const userId = request.headers.get("x-user");
  const { loreId } = await params;

  if (!userId) {
    return NextResponse.json({ isLiked: false, success: true }, { status: 200 });
  }

  if (!mongoose.Types.ObjectId.isValid(loreId)) {
    return NextResponse.json({ error: "Invalid Lore ID", success: false }, { status: 400 });
  }

  try {
    await dbConnect();

    const objectLoreId = new mongoose.Types.ObjectId(loreId);
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const existingLike = await LoreLike.findOne({
      loreId: objectLoreId,
      userId: objectUserId,
    });

    if (existingLike) {
      return NextResponse.json({ isLiked: true, success: true }, { status: 200 });
    } else {
      return NextResponse.json({ isLiked: false, success: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Failed to toggle lore dislike:", error);
    return NextResponse.json(
      { error: "Failed to toggle lore dislike", success: false },
      { status: 500 }
    );
  }
}
