import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/config/db";

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  await dbConnect();
  const { username } = await params;

  try {
    const user = await User.findOne({ username }).select(
      "name email country about links followersCount followingCount verified"
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
