import dbConnect from "@/config/db";
import Page from "@/models/Page";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const authorId = req.headers.get("x-user");

    if (!authorId) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const query: any = {
      authorId: authorId,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        ...(mongoose.Types.ObjectId.isValid(search) ? [{ _id: search }] : []),
      ];
    }

    const skip = (page - 1) * limit;
    const totalDocs = await Page.countDocuments(query);
    const pages = await Page.find(query)
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      pages,
      pagination: {
        pages: totalDocs,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(totalDocs / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
