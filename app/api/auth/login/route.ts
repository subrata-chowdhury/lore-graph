import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user"; // Assuming you have a User model defined
import { SignJWT } from "jose";
import dbConnect from "@/config/db";
import crypto from "crypto";
import Session from "@/models/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return new NextResponse("Email and password are required", { status: 400 });
  }

  await dbConnect();

  const user = await User.findOne({ email, isDeleted: false });

  if (!user) {
    return new NextResponse("Invalid email or password", { status: 406 });
  }

  const buffer = Buffer.from(password, "base64");
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined in environment variables");
  }
  const decryptedPassword = crypto.privateDecrypt(process.env.PRIVATE_KEY, buffer).toString("utf8");

  const isPasswordValid = await bcrypt.compare(decryptedPassword, user.password);

  if (!isPasswordValid) {
    return new NextResponse("Invalid email or password", { status: 406 });
  }

  const requestInfo = {
    ip: req.headers.get("x-forwarded-for"),
    agent: req.headers.get("user-agent")?.split(")")[0] + ")" || "unknown",
    language: req.headers.get("accept-language"),
  };

  const token = await new SignJWT({
    userId: user._id.toString(),
    username: user.username,
    verified: user.verified,
    ip: requestInfo.ip,
    deviceInfo: requestInfo.agent,
    language: requestInfo.language,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const res = NextResponse.json({
    message: "Login successful",
    user: { verified: user.verified, name: user.name, email: user.email },
    token,
  });

  // Split the token into chunks to fit into cookies
  const CHUNK_SIZE = 2000;
  const chunks = [];
  for (let i = 0; i < token.length; i += CHUNK_SIZE) {
    chunks.push(token.slice(i, i + CHUNK_SIZE));
  }
  chunks.forEach((chunk, index) => {
    res.cookies.set(`session.${index}`, chunk, {
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
  });
  res.cookies.set("session_chunks", chunks.length.toString(), {
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  await new Session({
    user: user._id,
    agent: requestInfo.agent || "unknown",
    language: requestInfo.language || "unknown",
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
  }).save();

  return res;
}
