import { generateFullTokenFromChunks } from "@/libs/splittedCookieGetter";
import verifyToken from "@/libs/tokenVerify";
import { AuthTokenPayloadType } from "@/types/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
  const user = await validateToken();
  if (!user) redirect("/login?redirect=/settings/profile-informations");
  return <>{children}</>;
};

export default layout;

async function validateToken() {
  try {
    const token = await generateFullTokenFromChunks("session");
    if (!token) {
      return null;
    }
    const user = await verifyToken<AuthTokenPayloadType>(token, "user");
    if (!user) {
      return null;
    }

    const headersObj = await headers();
    const requestInfo = {
      ip: headersObj.get("x-forwarded-for"),
      agent: headersObj.get("user-agent")?.split(")")[0] + ")" || "unknown",
      language: headersObj.get("accept-language"),
    };

    if (
      user.ip !== requestInfo.ip ||
      user.deviceInfo !== requestInfo.agent ||
      user.language !== requestInfo.language
    ) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
