import dbConnect from "@/config/db";
import Page from "@/models/page";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { title, description, slug, tags, lvls, bgImgUrl, visibility } = body;

    // Try to get authorId from headers (if middleware sets it) or body
    const authorId = req.headers.get("x-user");

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
