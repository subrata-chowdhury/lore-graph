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
  const user = await getUser(username);

  if (!user) {
    notFound();
  }

  const userId = user._id.toString();
  const pages = await getPages(userId);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Banner Image */}
      <div className="relative h-40 w-full bg-gray-300 md:h-60 dark:bg-gray-700">
        <BannerImage userId={userId} userName={user.name} />
      </div>

      <div className="px-4 sm:px-6 lg:mx-10 lg:px-8">
        <div className="relative -mt-20 mb-6 sm:-mt-10">
          <div className="flex flex-col items-center sm:flex-row sm:items-end">
            {/* Profile Picture */}
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-48 sm:w-48 dark:border-gray-900 dark:bg-gray-800">
              <ProfilePic userId={userId} userName={user.name} className="object-cover" />
            </div>

            {/* User Details */}
            <div className="mt-4 flex-1 pb-2 text-center sm:mt-0 sm:ml-6 sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                {user.verified && (
                  <Title title="Verified">
                    <RiVerifiedBadgeFill size={24} className="text-blue-500" title="verified" />
                  </Title>
                )}
              </div>
              <p className="font-medium text-gray-500 dark:text-gray-400">@{user.username}</p>
              {user.about && (
                <p className="text-sm font-medium text-gray-800 dark:text-gray-600">{user.about}</p>
              )}
              <div className="mt-3 flex items-center justify-center gap-6 sm:justify-start">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {numberFormatter(user.followingCount || 0)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {numberFormatter(user.followersCount || 0)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">About</h3>
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
                  <span>{getCountryDetails(user.country)?.label || "Unknown"}</span>
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
  );
};

export default UserPage;
