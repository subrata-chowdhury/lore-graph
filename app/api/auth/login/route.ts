import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import dbConnect from "@/config/db";
import crypto from "crypto";
import User from "@/models/User";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required", success: false },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    async function findByEmail(email: string) {
      const collections = [User];
      const promises = collections.map((collection) =>
        (collection as typeof User)
          .findOne({ email })
          .exec()
          .then((result: InstanceType<typeof User> | null) => ({
            model: collection.modelName,
            data: result,
          }))
      );
      const results = await Promise.all(promises);
      const user = results.find((result) => result.data !== null);
      if (user) {
        return { ...user.data.toObject(), type: user.model };
      }
      return null;
    }

    const user = await findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password", success: false },
        { status: 406 }
      );
    }

    const buffer = Buffer.from(password, "base64");
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is not defined in environment variables");
    }
    const decryptedPassword = crypto
      .privateDecrypt(process.env.PRIVATE_KEY, buffer)
      .toString("utf8");

    const isPasswordValid = await bcrypt.compare(decryptedPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password", success: false },
        { status: 406 }
      );
    }

    const requestInfo = {
      ip: req.headers.get("x-forwarded-for"),
      agent: req.headers.get("user-agent")?.split(")")[0] + ")" || "unknown",
      language: req.headers.get("accept-language"),
    };

    // Assuming you have a function to generate a token
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
      success: true,
      message: "Login successful",
      user: { verified: user.verified || false },
      token,
    });

    // split the token into chunks to fit into cookies (max size per cookie is around 4kb)
    const CHUNK_SIZE = 2000; // Leave 2kb (4kb - 2kb) for cookie metadata
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
    // Save the count so you know how many to read back
    res.cookies.set("session_chunks", chunks.length.toString(), {
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    await new Session({
      user: user._id,
      agent: requestInfo.agent || "unknown",
      language: requestInfo.language || "unknown",
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    }).save();

    return res;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Unable to login", success: false }, { status: 500 });
  }
}
