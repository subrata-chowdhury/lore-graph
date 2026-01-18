"use client";
import React, { useCallback, useEffect, useState } from "react";
import { PageType } from "@/types/types";
import StepsBar from "../_components/StepsBar";
import LevelsForm from "@/app/_components/Forms/LevelsForm";
import PageForm from "@/app/_components/Forms/PageForm";
import PageReviewForm from "@/app/_components/Forms/PageReviewForm";
import fetcher from "@/libs/fetcher";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

const CreatePage = () => {
  const [pageData, setPageData] = useState<
    Omit<PageType, "createdAt" | "updatedAt" | "authorId" | "rating" | "views" | "rated" | "likes">
  >({
    title: "Untitled Page",
    lvls: [],
    slug: "",
    description: "",
    tags: [],
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { pageId } = useParams();

  const saveHandler = useCallback(
    async (data: typeof pageData) => {
      setIsSubmitting(true);
      if (pageId)
        try {
          const { error } = await fetcher.put(`/super-admin/pages/${pageId}`, data);
          if (error) throw new Error(error);
          toast.success("Page updated successfully");
          router.push("/super-admin/pages");
        } catch (error: any) {
          toast.error(error?.message || "Failed to update page");
        } finally {
          setIsSubmitting(false);
        }
      else
        try {
          const { error } = await fetcher.post("/super-admin/pages", data);
          if (error) throw new Error(error);
          toast.success("Page created successfully");
          router.push("/super-admin/pages");
        } catch (error: any) {
          toast.error(error?.message || "Failed to create page");
        } finally {
          setIsSubmitting(false);
        }
    },
    [router, pageId]
  );

  const fetchData = useCallback(async () => {
    if (!pageId) return;
    try {
      const res = await fetcher.get<{
        success: boolean;
        data: PageType;
      }>(`/pages/${pageId}`);
      if (res.body?.success) {
        setPageData(res.body.data);
      } else {
        toast.error("Failed to fetch page data");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch page data");
    }
  }, [pageId]);

  useEffect(() => {
    fetchData();
  }, [pageId]);

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <StepsBar step={currentStep} onStepChange={setCurrentStep} />
      <div className="flex flex-1">
        {currentStep === 1 && (
          <PageForm
            pageData={pageData}
            onPageDataChange={setPageData}
            onSave={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <LevelsForm
            levels={pageData.lvls}
            onLevelsChange={(newLevels) => setPageData((prev) => ({ ...prev, lvls: newLevels }))}
            onSave={() => setCurrentStep(3)}
            onLevelDelete={(id) => {
              const newPageData = { ...pageData };
              const newLevels = newPageData.lvls.filter((lvl) => lvl.id !== id);
              newPageData.lvls = newLevels;
              saveHandler(newPageData);
            }}
          />
        )}
        {currentStep === 3 && (
          <PageReviewForm
            pageData={pageData}
            onPageDataChange={setPageData}
            onBack={() => setCurrentStep(2)}
            onSave={() => saveHandler(pageData)}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default CreatePage;
