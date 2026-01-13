import dbConnect from "@/config/db";
import Level, { ILevel } from "@/models/Level";
import Lore, { ILore } from "@/models/Lore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ levelId: string }> }
) {
  try {
    await dbConnect();
    const { levelId } = await params;

    const lvlData = (await Level.findById(levelId).lean()) as ILevel;

    if (!lvlData)
      return NextResponse.json({ error: "Level not found", success: false }, { status: 404 });

    const neededNodes = lvlData.levels.flat().map((l) => l._id);
    const lores = (await Lore.find({ _id: { $in: neededNodes } }).lean()) as ILore[];

    if (!lores || lores.length === 0) {
      return NextResponse.json(
        { error: "Lores not found for this level", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lores });
  } catch (error) {
    console.error("Error fetching lores for level:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}
