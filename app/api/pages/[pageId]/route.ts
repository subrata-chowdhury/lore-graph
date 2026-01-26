import dbConnect from "@/config/db";
import Page from "@/models/Page";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    await dbConnect();
    const { pageId } = await params;

    const page = await Page.findOne({ _id: pageId, visibility: "public" });

    if (!page) {
      return NextResponse.json({ error: "Page not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}

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

    // Check for duplicate slug if it's being changed
    const existingPageWithSlug = await Page.findOne({ slug, _id: { $ne: pageId } });
    if (existingPageWithSlug) {
      return NextResponse.json({ message: "Slug already exists" }, { status: 409 });
    }

    const updatedPage = await Page.findOneAndUpdate(
      { _id: pageId, authorId: authorId },
      {
        title,
        description,
        slug,
        tags: tags || [],
        lvls: lvls || [],
        bgImgUrl,
        visibility: visibility || "public",
      },
      { new: true }
    );

    if (!updatedPage) {
      return NextResponse.json({ message: "Page not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPage }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
