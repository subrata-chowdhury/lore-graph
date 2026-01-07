import Level from "@/models/level";
import dbConnect from "@/config/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, levels, type } = body;

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

    const newLevel = await Level.create({
      name,
      levels: levels || [],
      type: type || "draft",
    });

    return NextResponse.json(newLevel, { status: 201 });
  } catch (error: any) {
    console.error("Error creating level:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
