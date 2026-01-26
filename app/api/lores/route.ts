import dbConnect from "@/config/db";
import Lore from "@/models/Lore";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    // const visibility = searchParams.get("visibility");
    const tags = searchParams.get("tags");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;
    const username = searchParams.get("username");

    const query: any = { visibility: "public" };

    // Text search using the index defined in the model
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        ...(mongoose.Types.ObjectId.isValid(search) ? [{ _id: search }] : []), // Search by ID if it's a valid ObjectId
      ];
    }

    if (type) {
      query.type = type;
    }
    if (username) {
      query.createdBy = username;
    }
    if (tags) {
      query.tags = { $in: tags.split(",").map((tag) => tag.trim()) };
    }

    const skip = (page - 1) * limit;

    const lores = await Lore.find(query)
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit);

    const total = await Lore.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: lores,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching lores:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user");
    const userRole = request.headers.get("x-user-role");
    const username = request.headers.get("x-username");

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

    const newLore = new Lore({
      title: title.trim(),
      description: description.trim(),
      type,
      visibility: visibility || "private",
      src: src ? src.trim() : undefined,
      thumbnailUrl: thumbnailUrl,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [],
      createdBy: username,
      createdById: userId,
    });

    await newLore.save();

    return NextResponse.json({ data: newLore, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating lore:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}
