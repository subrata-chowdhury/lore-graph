import Level from "@/models/Level";
import type { ILevel } from "@/models/Level";
import type { IPage } from "@/models/Page";
import Page from "@/models/Page";
import GraphPage from "./_components/GraphPage";
import type { ILore } from "@/models/Lore";
import Lore from "@/models/Lore";
import { Metadata } from "next";
import { cache } from "react";
import dbConnect from "@/config/db";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const getPageData = cache(async (slug: string) => {
  await dbConnect();
  return (await Page.findOne({ slug, visibility: "public" }).lean()) as IPage;
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
  if (!pageData) return notFound();
  if ((level && currentLevel < 0) || currentLevel >= pageData.lvls.length) currentLevel = 0;
  const lvlData = (await Level.findById(pageData.lvls[currentLevel]?.id).lean()) as ILevel;

  if (!lvlData) return notFound();

  const neededNodes = lvlData.levels.flat().map((l) => l._id);
  const lores = (await Lore.find({ _id: { $in: neededNodes } }).lean()) as ILore[];

  return (
    <>
      <GraphPage
        pageData={{
          _id: pageData._id.toString(),
          title: pageData.title,
          lvls: pageData.lvls.map((l) => ({ ...l, id: l.id.toString() })),
          slug: pageData.slug,
          description: pageData.description,
          tags: pageData.tags,
          authorId: pageData.authorId,
          rating: pageData.rating,
          rated: pageData.rated,
          likes: pageData.likes,
          views: pageData.views,
          bgImgUrl: pageData.bgImgUrl,
          visibility: pageData.visibility,
          createdAt: pageData.createdAt.toString(),
          updatedAt: pageData.updatedAt.toString(),
        }}
        lvlData={lvlData.levels.map((level) =>
          level.map((node) => ({
            _id: node._id.toString(),
            next: node.next.map((n) => n.toString()),
          }))
        )}
        nData={lores.map((l) => ({
          ...l,
          _id: l._id.toString(),
          createdById: l.createdById.toString(),
          createdAt: pageData.createdAt.toString(),
          updatedAt: pageData.updatedAt.toString(),
        }))}
      />
    </>
  );
};

export default MainPage;
