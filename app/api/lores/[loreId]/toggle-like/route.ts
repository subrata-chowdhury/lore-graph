import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Lore from "@/models/Lore";
import LoreLike from "@/models/LoreLike";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ loreId: string }> }
) {
  const userId = request.headers.get("x-user");
  const { loreId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(loreId)) {
    return NextResponse.json({ error: "Invalid Lore ID" }, { status: 400 });
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
      // Unlike the lore
      await LoreLike.deleteOne({ _id: existingLike._id });
      await Lore.findByIdAndUpdate(objectLoreId, { $inc: { likesCount: -1 } });
      return NextResponse.json({ message: "Lore unliked" }, { status: 200 });
    } else {
      // Like the lore
      await LoreLike.create({ loreId: objectLoreId, userId: objectUserId });
      await Lore.findByIdAndUpdate(objectLoreId, { $inc: { likesCount: 1 } });
      return NextResponse.json({ message: "Lore liked" }, { status: 200 });
    }
  } catch (error) {
    console.error("Failed to toggle lore like:", error);
    return NextResponse.json({ error: "Failed to toggle lore like" }, { status: 500 });
  }
}
