import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Lore from "@/models/lore";
import LoreDislike from "@/models/loreDislike";
import mongoose from "mongoose";

export async function POST(request: NextRequest, { params }: { params: { loreId: string } }) {
  const userId = request.headers.get("x-user");
  const { loreId } = params;

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

    const existingDislike = await LoreDislike.findOne({
      loreId: objectLoreId,
      userId: objectUserId,
    });

    if (existingDislike) {
      // Undislike the lore
      await LoreDislike.deleteOne({ _id: existingDislike._id });
      await Lore.findByIdAndUpdate(objectLoreId, { $inc: { dislikesCount: -1 } });
      return NextResponse.json({ message: "Lore undisliked" }, { status: 200 });
    } else {
      // Dislike the lore
      await LoreDislike.create({ loreId: objectLoreId, userId: objectUserId });
      await Lore.findByIdAndUpdate(objectLoreId, { $inc: { dislikesCount: 1 } });
      return NextResponse.json({ message: "Lore disliked" }, { status: 200 });
    }
  } catch (error) {
    console.error("Failed to toggle lore dislike:", error);
    return NextResponse.json({ error: "Failed to toggle lore dislike" }, { status: 500 });
  }
}
