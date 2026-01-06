import dbConnect from "@/config/db";
import Lore from "@/models/lore";
import User from "@/models/user";
import SuperAdmin from "@/models/superAdmin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user");
    const userRole = request.headers.get("x-user-role");

    if (!userId || userRole !== "super-admin") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type, visibility, src, thumbnailUrl, tags } = body;

    // Input Validation & Sanitization
    if (!title || typeof title !== "string" || title.trim().length === 0 || title.length > 100) {
      return NextResponse.json(
        { error: "Title is required, must be a string, and under 100 characters", success: false },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required and must be a string", success: false },
        { status: 400 }
      );
    }

    const validTypes = ["video", "youtube", "post"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(", ")}`, success: false },
        { status: 400 }
      );
    }

    if (type === "video" && !thumbnailUrl) {
      return NextResponse.json(
        { error: "Thumbnail URL is required for video type", success: false },
        { status: 400 }
      );
    }

    if (type === "youtube" && !src) {
      return NextResponse.json(
        { error: "Source URL is required for youtube type", success: false },
        { status: 400 }
      );
    }

    const validVisibility = ["public", "private"];
    if (visibility && !validVisibility.includes(visibility)) {
      return NextResponse.json(
        { error: `Visibility must be one of: ${validVisibility.join(", ")}`, success: false },
        { status: 400 }
      );
    }

    if (src && (typeof src !== "string" || src.length > 150)) {
      return NextResponse.json(
        { error: "Source must be a string and under 150 characters", success: false },
        { status: 400 }
      );
    }

    if (tags && (!Array.isArray(tags) || !tags.every((t) => typeof t === "string"))) {
      return NextResponse.json(
        { error: "Tags must be an array of strings", success: false },
        { status: 400 }
      );
    }

    let user = await User.findById(userId).select("name");
    if (!user) {
      user = await SuperAdmin.findById(userId).select("name");
    }

    if (!user) {
      return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
    }

    const newLore = new Lore({
      title: title.trim(),
      description: description.trim(),
      type,
      visibility: visibility || "private",
      src: src ? src.trim() : undefined,
      thumbnailUrl: thumbnailUrl,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [],
      createdBy: user.name,
      createdById: userId,
    });

    await newLore.save();

    return NextResponse.json({ data: newLore, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating lore:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}
