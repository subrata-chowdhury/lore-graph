import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import verifyToken from "@/libs/tokenVerify";
import { AuthTokenPayloadType } from "./types/types";
import { generateFullTokenFromChunks } from "./libs/splittedCookieGetter";

export async function proxy(request: NextRequest) {
  const excludeTokenVerification = [
    "/api/super-admin/auth/login",
    "/api/auth/login",
    "/api/auth/signup",
  ];
  const excludeTokenVerificationPatterns = [/^\/api\/tests\/.*/, /^\/api\/labs\/.*/];
  if (
    excludeTokenVerification.includes(request.nextUrl.pathname) ||
    excludeTokenVerificationPatterns.some((pattern) => pattern.test(request.nextUrl.pathname))
  ) {
    return NextResponse.next();
  }

  let userType: "super-admin" | "user" = "user";
  if (request.nextUrl.pathname.includes("/super-admin")) userType = "super-admin";

  let token = null;
  switch (userType) {
    case "super-admin":
      token = await generateFullTokenFromChunks("super_admin_session");
      if (!token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      break;

    case "user": {
      token = await generateFullTokenFromChunks("session");
      if (!token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      break;
    }

    default:
      token = await generateFullTokenFromChunks("session");
      if (!token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      break;
  }

  let user: AuthTokenPayloadType | boolean = false;
  if (token) {
    user = await verifyToken<AuthTokenPayloadType>(token, userType);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const requestInfo = {
      ip: request.headers.get("x-forwarded-for"),
      agent: request.headers.get("user-agent")?.split(")")[0] + ")" || "unknown",
      language: request.headers.get("accept-language"),
    };
    if (
      user.ip !== requestInfo.ip ||
      user.deviceInfo !== requestInfo.agent ||
      user.language !== requestInfo.language
    ) {
      return NextResponse.json({ error: "Invalid device" }, { status: 401 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user", user.userId);
    requestHeaders.set("x-user-role", userType);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } else {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/:path*"], // Apply middleware to every URL
};
