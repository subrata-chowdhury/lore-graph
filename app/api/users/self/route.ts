import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/config/db";

export async function GET(req: Request) {
  await dbConnect();
  const userId = req.headers.get("x-user");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized", success: false }, { status: 400 });
  }

  try {
    const user = await User.findById(userId).select(
      "name username email country about links followersCount followingCount verified profileImage"
    );
    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
