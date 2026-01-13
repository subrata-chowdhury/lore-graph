import dbConnect from "@/config/db";
import Level from "@/models/Level";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ levelId: string }> }
) {
  try {
    await dbConnect();
    const { levelId } = await params;

    const level = await Level.findById(levelId);

    if (!level) {
      return NextResponse.json({ error: "Level not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: level });
  } catch (error) {
    console.error("Error fetching level:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}
