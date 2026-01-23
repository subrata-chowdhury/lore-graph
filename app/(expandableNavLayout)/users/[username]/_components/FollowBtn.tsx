"use client";
import { useAppContext } from "@/contexts/AppContext";
import fetcher from "@/libs/fetcher";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

type Props = {
  isFollowing: boolean;
  followingUsername: string;
};

function FollowBtn({ isFollowing = false, followingUsername }: Props) {
  const [currentIsFollowing, setCurrentIsFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const { user } = useAppContext();
  const router = useRouter();

  const follow = async () => {
    setLoading(true);
    try {
      const res = await fetcher.post<{}, { success: boolean }>(
        `/users/${followingUsername}/follow/`,
        {}
      );
      if (res.body?.success) {
        setCurrentIsFollowing(true);
      } else {
        toast.error(res.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async () => {
    setLoading(true);
    try {
      const res = await fetcher.post<{}, { success: boolean }>(
        `/users/${followingUsername}/unfollow`,
        {}
      );
      if (res.body?.success) {
        setCurrentIsFollowing(false);
      } else {
        toast.error(res.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => {
        if (!user) {
          router.push(`/login?redirect=${window.location.pathname}`);
          return;
        }
        if (currentIsFollowing) {
          unfollow();
        } else {
          follow();
        }
      }}
      disabled={loading}
      className={`cursor-pointer rounded-full px-4.5 py-1.5 text-sm font-semibold ${
        currentIsFollowing ? "bg-black/20" : "bg-black text-white"
      }`}
    >
      {currentIsFollowing ? "Following" : "Follow"}
    </button>
  );
}

export default FollowBtn;
