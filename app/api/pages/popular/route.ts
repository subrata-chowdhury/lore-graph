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
    const author = searchParams.get("author");

    const match: any = {};

    if (search) {
      match.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        ...(mongoose.Types.ObjectId.isValid(search)
          ? [{ _id: new mongoose.Types.ObjectId(search) }]
          : []),
      ];
    }

    if (author) {
      // Attempt to cast to ObjectId if valid, otherwise use string
      if (mongoose.Types.ObjectId.isValid(author)) {
        match.authorId = new mongoose.Types.ObjectId(author);
      } else {
        match.authorId = author;
      }
    }

    const skip = (page - 1) * limit;

    // Aggregation pipeline to calculate popularity score and sort
    const pipeline: any[] = [
      { $match: match },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $ifNull: ["$views", 0] }, // 1 point per view
              { $multiply: [{ $ifNull: ["$likes", 0] }, 5] }, // 5 points per like
              { $multiply: [{ $ifNull: ["$rated", 0] }, 2] }, // 2 points per rating count
              { $multiply: [{ $ifNull: ["$rating", 0] }, 10] }, // 10 points per rating star (avg)
            ],
          },
        },
      },
      { $sort: { popularityScore: -1 } }, // Sort by highest score
      { $skip: skip },
      { $limit: limit },
    ];

    // Separate pipeline for counting total documents matching the filter
    const countPipeline = [{ $match: match }, { $count: "total" }];

    const [pages, countResult] = await Promise.all([
      Page.aggregate(pipeline),
      Page.aggregate(countPipeline),
    ]);

    const totalDocs = countResult.length > 0 ? countResult[0].total : 0;

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
    console.error("Error fetching popular pages:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
