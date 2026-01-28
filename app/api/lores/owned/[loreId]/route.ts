import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Lore from "@/models/Lore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loreId: string }> }
) {
  try {
    await dbConnect();
    const { loreId } = await params;
    const userId = request.headers.get("x-user");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const lore = await Lore.findOne({ _id: loreId, createdById: userId });

    if (!lore) {
      return NextResponse.json({ error: "Lore not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: lore });
  } catch (error) {
    console.error("Error fetching lore:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}
