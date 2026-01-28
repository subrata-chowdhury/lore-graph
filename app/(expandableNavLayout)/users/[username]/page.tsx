import React, { cache } from "react";
import { notFound } from "next/navigation";
import User from "@/models/User";
import dbConnect from "@/config/db";
import ProfilePic from "./_components/ProfilePic";
import Page from "@/models/Page";
import Link from "next/link";
import BannerImage from "./_components/BannerImage";
import { LuMail } from "react-icons/lu";
import { LuCalendarDays } from "react-icons/lu";
import { GrLocation } from "react-icons/gr";
import { getCountryDetails } from "@/utils/getCountryDetails";
import numberFormatter from "@/libs/numberFormatter";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Title from "@/ui/components/Title";
import { Metadata } from "next";
import Topbar from "../../_components/Topbar";
import { generateFullTokenFromChunks } from "@/libs/splittedCookieGetter";
import verifyToken from "@/libs/tokenVerify";
import { headers } from "next/headers";
import { AuthTokenPayloadType } from "@/types/types";
import { BiPencil } from "react-icons/bi";
import Follow from "@/models/Follow";
import FollowBtn from "./_components/FollowBtn";
import { UserType } from "@/types/userTypes";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

const getUser = cache(async (username: string) => {
  await dbConnect();

  const user = await User.findOne({ username }).lean();
  return user;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) return { title: "Not Found" };

  return {
    title: "@" + user.username,
    description: user.about || "No description provided",
  };
}

async function getPages(userId: string) {
  await dbConnect();

  const pages = await Page.find({ authorId: userId }).lean();
  return pages;
}

const UserPage = async ({ params }: Props) => {
  const { username } = await params;
  const user = (await getUser(username)) as UserType & { _id: string };

  if (!user) {
    notFound();
  }

  const userId = user._id.toString();
  const pages = await getPages(userId);

  const owner = await validateToken();
  const isOwner: boolean = owner?.username === user.username && owner?.userId === userId;

  const isFollowing =
    owner && !isOwner
      ? !!(await Follow.findOne({
          follower: owner.userId,
          following: user._id,
        }))
      : false;

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900">
        {/* Banner Image */}
        <div className="relative h-40 w-full bg-gray-300 md:h-60 dark:bg-gray-700">
          {isOwner && (
            <div className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-500">
              <BiPencil size={18} className="text-white" />
            </div>
          )}
          <BannerImage bannerImage={user.bannerImage} userName={user.name} />
        </div>

        <div className="px-4 sm:px-6 lg:mx-10 lg:px-8">
          <div className="relative -mt-20 mb-6 md:-mt-10">
            <div className="flex flex-col items-center md:flex-row md:items-end">
              {/* Profile Picture */}
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-48 sm:w-48 dark:border-gray-900 dark:bg-gray-800">
                <ProfilePic
                  imageUrl={user.profileImage}
                  userName={user.name}
                  className="object-cover"
                />
                {isOwner && (
                  <div className="group absolute top-0 left-0 flex h-full w-full cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/20">
                    <BiPencil
                      className="text-white opacity-0 transition-opacity group-hover:opacity-100"
                      size={28}
                    />
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="mt-4 flex-1 pb-2 text-center md:mt-0 md:ml-6 md:text-left">
                <div className="mb-2 flex flex-col items-center gap-2 md:mb-0 md:flex-row md:gap-6">
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </h1>
                    {user.verified && (
                      <Title title="Verified">
                        <RiVerifiedBadgeFill size={24} className="text-blue-500" title="verified" />
                      </Title>
                    )}
                  </div>
                  {!isOwner && (
                    <FollowBtn isFollowing={isFollowing} followingUsername={user.username} />
                  )}
                </div>
                <p className="font-medium text-gray-500 dark:text-gray-400">@{user.username}</p>
                {user.about && (
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-600">
                    {user.about}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-center gap-6 md:justify-start">
                  <Link href={`/@${user.username}/followings`} className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {numberFormatter(user.followingCount || 0)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Followings</span>
                  </Link>
                  <Link href={`/@${user.username}/followers`} className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {numberFormatter(user.followersCount || 0)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-1">
              <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">About</h3>
                  {isOwner && (
                    <Link href={"/settings/profile-informations"} className="flex cursor-pointer">
                      <BiPencil size={16} className="text-gray-500" />
                    </Link>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <LuCalendarDays size={20} className="text-gray-400" />
                    <span>Joined {new Date(user.createdAt).toDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <LuMail size={20} className="text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <GrLocation size={20} className="text-gray-400" />
                    <span>
                      {user.country
                        ? getCountryDetails(user.country)?.label || "Unknown"
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder for posts or other content */}
            <div className="md:col-span-2">
              {pages.length <= 0 && (
                <div className="flex min-h-50 items-center justify-center rounded-xl bg-white p-6 text-gray-500 shadow dark:bg-gray-800">
                  No posts yet.
                </div>
              )}
              {pages.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {pages.map((page) => (
                    <Link
                      href={`/${page.slug}`}
                      target="_blank"
                      key={page._id}
                      className="rounded-xl bg-white p-6 py-5 shadow dark:bg-gray-800"
                    >
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {page.title}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {page.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {page.views || 0} Views
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPage;

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
