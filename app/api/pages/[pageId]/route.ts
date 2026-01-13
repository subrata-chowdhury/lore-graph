import dbConnect from "@/config/db";
import Page from "@/models/Page";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    await dbConnect();
    const { pageId } = await params;

    const page = await Page.findById(pageId);

    if (!page) {
      return NextResponse.json({ error: "Page not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}
