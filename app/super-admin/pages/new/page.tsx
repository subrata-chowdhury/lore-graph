"use client";
import React, { useState } from "react";
import { PageType } from "@/types/types";
import StepsBar from "../_components/StepsBar";
import LevelsForm from "@/ui/Forms/LevelsForm";
import PageForm from "@/ui/Forms/PageForm";

type Props = {};

const CreatePage = (props: Props) => {
  const [pageData, setPageData] = useState<Omit<PageType, "_id" | "createdAt" | "updatedAt">>({
    title: "",
    lvls: [],
    slug: "",
    description: "",
    tags: [],
    authorId: "",
    rating: 0,
    rated: 0,
    views: 0,
  });
  const [currentStep, setCurrentStep] = useState(1);

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
        {currentStep === 2 && <LevelsForm levels={pageData.lvls} />}
      </div>
    </div>
  );
};

export default CreatePage;
