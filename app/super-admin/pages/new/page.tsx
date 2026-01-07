"use client";
import React, { useCallback, useState } from "react";
import { PageType } from "@/types/types";
import StepsBar from "../_components/StepsBar";
import LevelsForm from "@/app/_components/Forms/LevelsForm";
import PageForm from "@/app/_components/Forms/PageForm";
import PageReviewForm from "@/app/_components/Forms/PageReviewForm";
import fetcher from "@/libs/fetcher";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Props = {};

const CreatePage = (props: Props) => {
  const [pageData, setPageData] = useState<
    Omit<
      PageType,
      "_id" | "createdAt" | "updatedAt" | "authorId" | "rating" | "views" | "rated" | "likes"
    >
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

  const saveHandler = useCallback(
    async (data: typeof pageData) => {
      setIsSubmitting(true);
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
    [router]
  );

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
