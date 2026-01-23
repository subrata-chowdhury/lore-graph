import dbConnect from "@/config/db";
import Follow from "@/models/Follow";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") === "asc" ? 1 : -1;

  const query: any = { followingUsername: username };

  if (search) {
    query.$or = [
      { followerName: { $regex: search, $options: "i" } },
      { followerUsername: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const totalDocs = await Follow.countDocuments(query);
    const followers = await Follow.find(query)
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      followers,
      pagination: {
        total: totalDocs,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(totalDocs / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
