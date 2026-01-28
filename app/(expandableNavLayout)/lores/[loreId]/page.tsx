"use client";
import fetcher from "@/libs/fetcher";
import { useParams } from "next/navigation";
import { LoreType } from "@/types/loreTypes";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoreForm from "@/app/_components/Forms/LoreForm";

const LoreFormPage = () => {
  const { loreId } = useParams();
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

  async function fetchLore() {
    try {
      const { body, error } = await fetcher.get<{ data: LoreType }>(`/lores/owned/${loreId}`);
      if (body && body.data) {
        setLoreData(body.data);
      } else {
        toast.error(error || "Failed to fetch lore");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  async function saveLore() {
    try {
      const { body, error } = await fetcher.put<
        typeof loreData,
        { success: boolean; error?: string }
      >("/lores/" + loreId, loreData);

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

  useEffect(() => {
    if (loreId) {
      fetchLore();
    }
  }, []);

  return <LoreForm loreData={loreData} onLoreDataChange={setLoreData} onSave={saveLore} />;
};

export default LoreFormPage;
