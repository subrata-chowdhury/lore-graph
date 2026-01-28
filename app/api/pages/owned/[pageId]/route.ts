import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Page from "@/models/Page";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    await dbConnect();
    const { pageId } = await params;
    const userId = request.headers.get("x-user");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const lore = await Page.findOne({ _id: pageId, authorId: userId });

    if (!lore) {
      return NextResponse.json({ error: "Page not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: lore });
  } catch (error) {
    console.error("Error fetching lore:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}
