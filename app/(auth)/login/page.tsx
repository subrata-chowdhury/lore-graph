"use client";
import React, { useState } from "react";
import fetcher from "@/libs/fetcher";
import Link from "next/link";
import PasswordInput from "@/ui/components/Inputs/PasswordInput";
import Input from "@/ui/components/Inputs/Input";
import { toast } from "react-toastify";
import { encryptData } from "@/libs/encryption";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    field: "",
    msg: "",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function login(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    // verification logic
    if (!email || email?.length <= 0) {
      setError({ field: "email", msg: "Email is required" });
      return;
    }
    if (!password || password?.length <= 0) {
      setError({ field: "password", msg: "Password is required" });
      return;
    }
    setLoading(true);
    await fetcher
      .post<
        { email: string; password: string },
        { user: { verified: boolean; institution: string; type: string }; token: string }
      >("/super-admin/auth/login", { email, password: await encryptData(password) })
      .then(async (res) => {
        if (res.status !== 200) {
          toast.error(res.error || "Error signing up");
          return;
        }
        if (res.body) {
          // Store token securely
          // document.cookie = `superAdminToken=${res.body.token}; path=/; secure; samesite=strict`;
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get("redirect") || "/super-admin";
          setTimeout(() => router.replace(redirectUrl), 300);
        }
      });
    setLoading(false);
  }

  return (
    <div className="flex h-screen flex-col gap-0 md:flex-row">
      <div className="hidden h-full w-full flex-col items-center justify-center gap-4 bg-gray-200 md:flex md:w-1/2 dark:bg-white/10">
        <h1 className="text-center text-2xl font-semibold">Welcome Back to Lore Graph</h1>
        <div className="text-center"></div>
      </div>
      <div className="absolute flex h-full w-full flex-col items-center justify-center md:relative md:h-auto md:w-1/2">
        <h1 className="w-11/12 max-w-112.5 ps-0 pb-3 text-center text-2xl font-semibold md:w-9/12 md:pb-0 md:pl-6 md:text-start">
          Log In to Lore Graph
        </h1>
        <form className="flex w-11/12 max-w-112.5 flex-col gap-4 rounded-md bg-transparent p-6 md:w-9/12">
          <Input
            label="Email"
            value={email}
            onChange={(val) => setEmail(val.trim())}
            error={error.field == "email" && error.msg?.length > 0 ? error.msg : ""}
            name="email"
            placeholder="eg., example@email.com"
          />
          <div className="flex flex-col gap-1">
            <PasswordInput
              label="Password"
              value={password}
              onChange={(val) => setPassword(val)}
              error={error.field == "password" && error.msg?.length > 0 ? error.msg : ""}
              name="password"
              placeholder="Password"
            />
            <div className="ms-auto text-[0.9rem] font-medium text-blue-600">
              <Link href="#" onClick={() => toast.info("Currently out of service")}>
                Forgot Password
              </Link>
            </div>
          </div>
          <button
            className="bg-primary rounded p-2 text-white dark:bg-white/15"
            onClick={login}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/sign-up" className="font-medium text-blue-600">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
