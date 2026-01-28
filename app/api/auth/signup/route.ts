import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import User from "@/models/User";
import { SignJWT } from "jose";
import dbConnect from "@/config/db";
import crypto from "crypto";
import Session from "@/models/Session";

export async function POST(request: NextRequest) {
  let { name, username, email, password, country } = await request.json();

  // Sanitization
  name = name?.trim();
  username = username?.trim();
  email = email?.trim();
  password = password?.trim();
  country = country?.trim();

  if (!name || !username || !email || !password) {
    return NextResponse.json(
      { error: "Name, Username, Email and Password are required", success: false },
      { status: 400 }
    );
  }

  // Advanced Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address", success: false }, { status: 400 });
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return NextResponse.json(
      {
        error: "Username must be 3-20 characters and alphanumeric (underscores allowed)",
        success: false,
      },
      { status: 400 }
    );
  }

  if (name.length < 2 || name.length > 50) {
    return NextResponse.json(
      { error: "Name must be between 2 and 50 characters", success: false },
      { status: 400 }
    );
  }

  await dbConnect();

  const buffer = Buffer.from(password, "base64");
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined in environment variables");
  }
  const decryptedPassword = crypto.privateDecrypt(process.env.PRIVATE_KEY, buffer).toString("utf8");

  if (decryptedPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long", success: false },
      { status: 400 }
    );
  }
  if (decryptedPassword.length > 100) {
    return NextResponse.json(
      { error: "Password cannot exceed 100 characters", success: false },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(decryptedPassword, 10);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isDeleted) {
      existingUser.isDeleted = false;
      existingUser.password = hashedPassword;
      await existingUser.save();

      const requestInfo = {
        ip: request.headers.get("x-forwarded-for"),
        agent: request.headers.get("user-agent")?.split(")")[0] + ")" || "unknown",
        language: request.headers.get("accept-language"),
      };

      const token = await new SignJWT({
        userId: existingUser._id.toString(),
        username: existingUser.username,
        profileImage: existingUser.profileImage,
        verified: existingUser.verified,
        ip: requestInfo.ip,
        deviceInfo: requestInfo.agent,
        language: requestInfo.language,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(Math.floor(Date.now() / 1000) + 3 * 30 * 24 * 60 * 60) // 6 months
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

      return NextResponse.json({
        success: true,
        message: "Recover successful",
        user: { verified: existingUser.verified || false },
        token,
      });
    }
    // User already exists, return an error response
    return NextResponse.json(
      { error: "User already exists. Please log in.", success: false },
      { status: 400 }
    );
  }

  const existingUsername = await User.findOne({ username });

  if (existingUsername) {
    return NextResponse.json({ error: "Username already taken", success: false }, { status: 400 });
  }

  const newUser = new User({
    name,
    username,
    email,
    password: hashedPassword,
    country,
  });

  try {
    await newUser.save();
    return NextResponse.json(
      { message: "User created successfully", success: true },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: "Error saving user", success: false }, { status: 500 });
  }
}
