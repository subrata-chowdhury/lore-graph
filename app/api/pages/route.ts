import dbConnect from "@/config/db";
import Page from "@/models/Page";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;
    const author = searchParams.get("author");

    const query: any = { visibility: "public" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        ...(mongoose.Types.ObjectId.isValid(search) ? [{ _id: search }] : []),
      ];
    }
    if (author) {
      query.authorId = author;
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

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { title, description, slug, tags, lvls, bgImgUrl, visibility } = body;

    // Try to get authorId from headers (if middleware sets it) or body
    const authorId = req.headers.get("x-user");
    const username = req.headers.get("x-username");
    const profileImage = req.headers.get("x-profile-image");

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    if (!authorId) {
      return NextResponse.json({ message: "Author ID is required" }, { status: 400 });
    }

    if (!title || !description || !slug) {
      return NextResponse.json(
        { message: "Title, description, and slug are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return NextResponse.json({ message: "Slug already exists" }, { status: 409 });
    }

    const newPage = await Page.create({
      title,
      description,
      slug,
      tags: tags || [],
      lvls: lvls || [],
      bgImgUrl,
      visibility: visibility || "public",
      authorId,
      authorUsername: username,
      authorProfileImage: profileImage,
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (error: any) {
    console.error("Error creating page:", error);
    // Handle duplicate key error (code 11000) if race condition occurs
    if (error.code === 11000) {
      return NextResponse.json({ message: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
