import dbConnect from "@/config/db";
import Lore from "@/models/Lore";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const authorId = request.headers.get("x-user");

    if (!authorId) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const visibility = searchParams.get("visibility");
    const tags = searchParams.get("tags");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const query: any = { createdById: authorId };

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
    if (visibility) {
      query.visibility = visibility;
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
