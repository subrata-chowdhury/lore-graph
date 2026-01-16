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
    return new NextResponse("Name, Username, Email and Password are required", { status: 400 });
  }

  // Advanced Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new NextResponse("Invalid email address", { status: 400 });
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return new NextResponse(
      "Username must be 3-20 characters and alphanumeric (underscores allowed)",
      { status: 400 }
    );
  }

  if (name.length < 2 || name.length > 50) {
    return new NextResponse("Name must be between 2 and 50 characters", { status: 400 });
  }

  await dbConnect();

  const buffer = Buffer.from(password, "base64");
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined in environment variables");
  }
  const decryptedPassword = crypto.privateDecrypt(process.env.PRIVATE_KEY, buffer).toString("utf8");

  if (decryptedPassword.length < 8) {
    return new NextResponse("Password must be at least 8 characters long", { status: 400 });
  }

  const hashedPassword = await hash(decryptedPassword, 10);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isDeleted) {
      existingUser.isDeleted = false;
      existingUser.password = hashedPassword;
      await existingUser.save();

      const token = await new SignJWT({
        id: existingUser._id,
        verified: existingUser.verified,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(Math.floor(Date.now() / 1000) + 3 * 30 * 24 * 60 * 60) // 6 months
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

      return NextResponse.json({
        message: "User reactivated successfully",
        user: { verified: false, name: existingUser.name, email: existingUser.email },
        token,
      });
    }
    // User already exists, return an error response
    return new NextResponse("User already exists. Please log in.", { status: 400 });
  }

  const existingUsername = await User.findOne({ username });

  if (existingUsername) {
    return new NextResponse("Username already taken", { status: 400 });
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
    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch {
    return new NextResponse("Error saving user", { status: 500 });
  }
}
