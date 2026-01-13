import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import mongoose from "mongoose";
import User from "@/models/User";
import dbConnect from "@/config/db";
import SuperAdmin from "@/models/SuperAdmin";
import ProfilePic from "./_components/ProfilePic";
import Page from "@/models/Page";
import Link from "next/link";
import BannerImage from "./_components/BannerImage";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

async function getUser(username: string) {
  await dbConnect();

  const user = await User.findOne({ username }).lean();
  return user;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner Image */}
      <div className="relative h-60 w-full bg-gray-300 md:h-80 dark:bg-gray-700">
        <BannerImage userId={userId} userName={user.name} />
      </div>

      <div className="px-4 sm:px-6 lg:mx-10 lg:px-8">
        <div className="relative -mt-20 mb-6 sm:-mt-20">
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
                  <span className="text-blue-500" title="Verified">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="font-medium text-gray-500 dark:text-gray-400">@{user.username}</p>

              {user.country && (
                <p className="mt-1 flex items-center justify-center gap-1 text-sm text-gray-500 sm:justify-start dark:text-gray-400">
                  <span>📍</span> {user.country}
                </p>
              )}

              <div className="mt-3 flex items-center justify-center gap-6 sm:justify-start">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.followingCount || 0}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.followersCount || 0}
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
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Joined {new Date(user.createdAt).toDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{user.email}</span>
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
