import Level from "@/models/level";
import type { ILevel } from "@/models/level";
import type { IPage } from "@/models/page";
import Page from "@/models/page";
import React from "react";
import Graph from "./_components/GraphPage";
import type { ILore } from "@/models/lore";
import Lore from "@/models/lore";
import NotFoundPage from "../not-found";
import { Metadata } from "next";
import { cache } from "react";
import dbConnect from "@/config/db";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const getPageData = cache(async (slug: string) => {
  await dbConnect();
  return (await Page.findOne({ slug }).lean()) as IPage;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getPageData(slug);

  if (!pageData) return { title: "Not Found" };

  return {
    title: pageData.title,
    description: pageData.description,
  };
}

const MainPage = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  const { level } = await searchParams;
  let currentLevel = Number(level) || 0;

  const pageData = await getPageData(slug);
  if (!pageData) return <NotFoundPage />;
  if ((level && currentLevel < 0) || currentLevel >= pageData.lvls.length) currentLevel = 0;
  const lvlData = (await Level.findOne({ _id: pageData.lvls[currentLevel]?.id }).lean()) as ILevel;

  if (!lvlData) return <NotFoundPage />;

  const neededNodes = lvlData.levels.flat().map((l) => l._id);
  const lores = (await Lore.find({ _id: { $in: neededNodes } }).lean()) as ILore[];

  return (
    <>
      <Graph
        pageData={JSON.parse(JSON.stringify(pageData))}
        lvlData={JSON.parse(JSON.stringify(lvlData.levels))}
        nData={JSON.parse(JSON.stringify(lores))}
      />
    </>
  );
};

export default MainPage;
