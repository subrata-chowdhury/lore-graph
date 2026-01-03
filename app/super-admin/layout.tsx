import React from "react";
import Topbar from "./_components/Topbar";
import Sidebar from "./_components/Sidebar";
import { cookies, headers } from "next/headers";
import verifyToken from "@/libs/tokenVerify";
import { redirect } from "next/navigation";
import { AuthTokenPayloadType } from "@/types/types";
import { generateFullTokenFromChunks } from "@/libs/splittedCookieGetter";

type Props = {
  children: React.ReactNode;
};

const SuperAdminLayout = async (props: Props) => {
  const user = await validateToken();

  if (!user) {
    const currentPath = (await headers()).get("x-invoke-path") || "/super-admin";
    redirect(`/login/super-admin?redirect=${encodeURIComponent(currentPath)}`);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col bg-black/3">
        <Topbar />
        <div className="flex flex-1 flex-col overflow-auto">{props.children}</div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;

async function validateToken() {
  try {
    const token = await generateFullTokenFromChunks("super_admin_session");
    if (!token) {
      return null;
    }
    const user = await verifyToken<AuthTokenPayloadType>(token, "super-admin");
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
