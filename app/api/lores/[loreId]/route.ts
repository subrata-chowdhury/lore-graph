import dbConnect from "@/config/db";
import Lore from "@/models/Lore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loreId: string }> }
) {
  try {
    await dbConnect();
    const { loreId } = await params;

    const lore = await Lore.findById(loreId);

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
