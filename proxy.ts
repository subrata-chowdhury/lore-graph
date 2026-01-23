import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import verifyToken from "@/libs/tokenVerify";
import { AuthTokenPayloadType } from "./types/types";
import { generateFullTokenFromChunks } from "./libs/splittedCookieGetter";

const excludeTokenVerification: {
  url: string;
  method: string;
}[] = [
  { url: "/api/auth/login", method: "POST" },
  { url: "/api/super-admin/auth/login", method: "POST" },
  { url: "/api/auth/signup", method: "POST" },
  { url: "/api/lores", method: "GET" },
  { url: "/api/pages", method: "GET" },
  { url: "/api/comments", method: "GET" },
  { url: "/api/users/self", method: "GET" },
  { url: "/api/pages/popular", method: "GET" },
];
const excludeTokenVerificationPatterns = [
  /^\/api\/tests\/.*/,
  /^\/api\/labs\/.*/,
  /^\/api\/users\/.*\/availability$/,
];

export async function proxy(request: NextRequest) {
  let isOpenApi = false;
  if (
    excludeTokenVerification.some(
      (item) => item.url === request.nextUrl.pathname && item.method === request.method
    ) ||
    excludeTokenVerificationPatterns.some((pattern) => pattern.test(request.nextUrl.pathname))
  ) {
    isOpenApi = true;
  }

  let userType: "super-admin" | "user" = "user";
  const isSuperAdminPath = request.nextUrl.pathname.includes("/super-admin");

  let token = null;
  if (isSuperAdminPath) {
    userType = "super-admin";
    token = await generateFullTokenFromChunks("super_admin_session");
  } else {
    // Try user session first, fallback to super-admin session for user APIs
    token = await generateFullTokenFromChunks("session");
    if (!token) {
      const adminToken = await generateFullTokenFromChunks("super_admin_session");
      if (adminToken) {
        token = adminToken;
        userType = "super-admin";
      }
    }
  }

  let user: AuthTokenPayloadType | boolean = false;
  if (token) {
    user = await verifyToken<AuthTokenPayloadType>(token, userType);
    if (!user) {
      if (isOpenApi) {
        return NextResponse.next();
      }
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
    requestHeaders.set("x-username", user.username);
    requestHeaders.set("x-user-role", userType);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } else {
    if (isOpenApi) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/:path*"], // Apply middleware to every URL
};
