"use client";
import React, { useState } from "react";
import fetcher from "@/libs/fetcher";
import Link from "next/link";
import PasswordInput from "@/ui/components/Inputs/PasswordInput";
import Input from "@/ui/components/Inputs/Input";
import { toast } from "react-toastify";
import { encryptData } from "@/libs/encryption";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(1);
  const [error, setError] = useState({
    field: "",
    msg: "",
  });
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  async function signup(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    // verification logic
    if (stage === 1) {
      if (!email.trim()) {
        setError({ field: "email", msg: "Email is required" });
        return;
      }
      if (!password) {
        setError({ field: "password", msg: "Password is required" });
        return;
      }
      if (password !== confirmPassword) {
        setError({ field: "confirmPassword", msg: "Passwords do not match" });
        return;
      }
      setError({ field: "", msg: "" });
      setStage(2);
      return;
    } else {
      if (!name.trim()) {
        setError({ field: "name", msg: "Name is required" });
        return;
      }
      if (!username.trim()) {
        setError({ field: "username", msg: "Username is required" });
        return;
      }
    }

    setError({ field: "", msg: "" });
    setLoading(true);

    try {
      const countryRes = await fetch("https://api.country.is/");
      let country;
      if (countryRes.ok) country = (await countryRes.json())?.country;

      const res = await fetcher.post<
        { name: string; username: string; email: string; password: string; country: string },
        { message: string }
      >("/auth/signup", {
        name,
        username,
        email,
        password: await encryptData(password),
        country,
      });

      if (res.status !== 201) {
        toast.error(res.error || "Error signing up");
      } else {
        toast.success(res.body?.message || "Signup successful! Please login.");
        setTimeout(() => router.push("/login"), 300);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col gap-0 md:flex-row">
      <div className="hidden h-full w-full flex-col items-center justify-center gap-4 bg-gray-200 md:flex md:w-1/2 dark:bg-white/10">
        <h1 className="text-center text-2xl font-semibold">Join Lore Graph</h1>
        <div className="text-center">Discover and share lores.</div>
      </div>
      <div className="absolute flex h-full w-full flex-col items-center justify-center md:relative md:h-auto md:w-1/2">
        <h1 className="w-11/12 max-w-112.5 ps-0 pb-3 text-center text-2xl font-semibold md:w-9/12 md:pb-0 md:pl-6 md:text-start">
          Create an Account
        </h1>
        <form className="flex w-11/12 max-w-112.5 flex-col gap-4 rounded-md bg-transparent p-6 md:w-9/12">
          {stage === 1 && (
            <>
              <Input
                label="Email"
                value={email}
                onChange={(val) => setEmail(val.trim())}
                error={error.field === "email" ? error.msg : ""}
                name="email"
                placeholder="eg., example@email.com"
              />
              <PasswordInput
                label="Password"
                value={password}
                onChange={(val) => setPassword(val)}
                error={error.field === "password" ? error.msg : ""}
                name="password"
                placeholder="Password"
              />
              <PasswordInput
                label="Confirm Password"
                value={confirmPassword}
                onChange={(val) => setConfirmPassword(val)}
                error={error.field === "confirmPassword" ? error.msg : ""}
                name="confirmPassword"
                placeholder="Confirm Password"
              />
            </>
          )}
          {stage === 2 && (
            <>
              <Input
                label="Full Name"
                value={name}
                onChange={(val) => setName(val)}
                error={error.field === "name" ? error.msg : ""}
                name="name"
                placeholder="eg., John Doe"
              />
              <Input
                label="Username"
                value={username}
                onChange={(val) => setUsername(val.trim())}
                error={error.field === "username" ? error.msg : ""}
                name="username"
                placeholder="eg., johndoe"
              />
            </>
          )}
          <button
            className="bg-primary rounded p-2 text-white dark:bg-white/15"
            onClick={signup}
            disabled={loading}
          >
            {loading ? "Creating Account..." : stage === 1 ? "Next" : "Sign Up"}
          </button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
