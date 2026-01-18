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

export async function PUT(req: Request, { params }: { params: Promise<{ levelId: string }> }) {
  try {
    await dbConnect();
    const { levelId } = await params;
    const body = await req.json();
    const { name, levels, type, _id } = body;
    if (!_id) {
      return NextResponse.json({ message: "Level ID is required" }, { status: 400 });
    }
    if (_id !== levelId) {
      return NextResponse.json(
        { message: "Level ID in body does not match URL ID" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Level name is required and must be a string" },
        { status: 400 }
      );
    }

    if (levels && !Array.isArray(levels)) {
      return NextResponse.json({ message: "Levels must be an array" }, { status: 400 });
    }

    if (type && !["draft", "published"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid type. Must be 'draft' or 'published'" },
        { status: 400 }
      );
    }

    const updatedLevel = await Level.findByIdAndUpdate(levelId, {
      name,
      levels: levels || [],
      type: type || "draft",
    });

    return NextResponse.json({ success: true, data: updatedLevel }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating level:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ levelId: string }> }) {
  try {
    await dbConnect();
    const { levelId } = await params;

    const deletedLevel = await Level.findByIdAndDelete(levelId);

    if (!deletedLevel) {
      return NextResponse.json({ error: "Level not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedLevel }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting level:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
