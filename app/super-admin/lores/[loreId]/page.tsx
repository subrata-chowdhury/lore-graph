"use client";
import fetcher from "@/libs/fetcher";
import { LoreType } from "@/types/loreTypes";
import LoreForm from "@/app/_components/Forms/LoreForm";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

const LoreFormPage = () => {
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
  const { loreId } = useParams();
  const route = useRouter();

  async function saveLore() {
    try {
      const { body, error } = await fetcher.put<
        typeof loreData,
        { success: boolean; error?: string }
      >(`/lores/${loreId}`, loreData);

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
        route.push("/super-admin/lores");
      } else {
        toast.error(error || body?.error || "Failed to create lore");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  const fetchData = useCallback(async () => {
    if (!loreId) return;
    try {
      const res = await fetcher.get<{
        success: boolean;
        data: LoreType;
      }>(`/lores/${loreId}`);
      if (res.body?.success) {
        setLoreData(res.body.data);
      } else {
        toast.error("Failed to fetch page data");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch page data");
    }
  }, [loreId]);

  useEffect(() => {
    fetchData();
  }, [loreId]);

  return <LoreForm loreData={loreData} onLoreDataChange={setLoreData} onSave={saveLore} />;
};

export default LoreFormPage;
