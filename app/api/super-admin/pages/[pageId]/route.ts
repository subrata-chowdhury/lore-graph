import dbConnect from "@/config/db";
import Page from "@/models/Page";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    await dbConnect();

    const { pageId } = await params;
    const body = await req.json();
    const { title, description, slug, tags, lvls, bgImgUrl, visibility, _id } = body;

    if (!pageId || !_id || !body) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }
    if (pageId !== _id) {
      return NextResponse.json(
        { message: "Page ID in path and body do not match" },
        { status: 400 }
      );
    }

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

    // Check for duplicate slug, excluding the current page
    const existingPage = await Page.findOne({ slug, _id: { $ne: _id } });
    if (existingPage) {
      return NextResponse.json({ message: "Slug already exists" }, { status: 409 });
    }

    const updatedPage = await Page.findOneAndUpdate(
      { _id: _id, authorId }, // Ensure the author owns the page
      {
        title,
        description,
        slug,
        tags: tags || [],
        lvls: lvls || [],
        bgImgUrl,
        visibility: visibility || "public",
      },
      { new: true } // Return the updated document
    );

    if (!updatedPage) {
      return NextResponse.json({ message: "Page not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updatedPage, { status: 200 });
  } catch (error: any) {
    console.error("Error updating page:", error);
    // Handle duplicate key error (code 11000) if race condition occurs
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Slug already exists. Please choose a different slug." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Error updating page", error: error.message },
      { status: 500 }
    );
  }
}
