"use client";
import fetcher from "@/libs/fetcher";
import { LoreType } from "@/types/loreTypes";
import React, { useState } from "react";
import { toast } from "react-toastify";
import LoreForm from "@/app/_components/Forms/LoreForm";

type Props = {};

const LoreFormPage = (props: Props) => {
  const [loreData, setLoreData] = useState<
    Omit<
      LoreType,
      | "_id"
      | "createdAt"
      | "updatedAt"
      | "likesCount"
      | "dislikesCount"
      | "viewsCount"
      | "commentsCount"
      | "createdBy"
      | "createdById"
    >
  >({
    title: "",
    description: "",
    tags: [],
    type: "youtube",
    visibility: "private",
  });

  async function saveLore() {
    try {
      const { body, error } = await fetcher.post<
        typeof loreData,
        { success: boolean; error?: string }
      >("/lores", loreData);

      if (body?.success) {
        toast.success("Lore created successfully");
        setLoreData({
          title: "",
          description: "",
          tags: [],
          type: "youtube",
          visibility: "private",
          src: "",
          thumbnailUrl: "",
        });
      } else {
        toast.error(error || body?.error || "Failed to create lore");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  return <LoreForm loreData={loreData} onLoreDataChange={setLoreData} onSave={saveLore} />;
};

export default LoreFormPage;
