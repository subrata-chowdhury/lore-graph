import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({
        exists: true,
        message: "Username already taken",
        success: true,
      });
    } else {
      return NextResponse.json({
        exists: false,
        message: "Username is available",
        success: true,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error checking username", success: false }, { status: 500 });
  }
}
