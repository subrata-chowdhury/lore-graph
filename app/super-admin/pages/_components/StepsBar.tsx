"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FaCircleCheck } from "react-icons/fa6";

const StepsBar = ({
  step,
  onStepChange,
}: {
  step: number;
  onStepChange: (step: number) => void;
}) => {
  const pathName = usePathname();
  return (
    <div className="relative flex justify-between px-8 py-1">
      <div
        onClick={() => onStepChange(1)}
        className="flex w-30 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md px-4 py-2 hover:bg-black/10"
      >
        <p className="text-sm">Basic Details</p>
        <div className="rounded-full bg-white">
          <FaCircleCheck className={`${step >= 1 ? "text-black" : "text-black/30"}`} />
        </div>
      </div>
      <div
        onClick={() => onStepChange(2)}
        className="flex w-30 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md px-4 py-2 hover:bg-black/10"
      >
        <p className="text-sm">Levels</p>
        <div className="rounded-full bg-white">
          <FaCircleCheck className={`${step >= 2 ? "text-black" : "text-black/30"}`} />
        </div>
      </div>
      <div
        onClick={() => onStepChange(3)}
        className="flex w-30 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md px-4 py-2 hover:bg-black/10"
      >
        <p className="text-sm">Review</p>
        <div className="rounded-full bg-white">
          <FaCircleCheck className={`${step === 3 ? "text-black" : "text-black/30"}`} />
        </div>
      </div>
      {/* Progress bar */}
      <div
        className={`absolute bottom-4.5 left-1/2 -z-1 h-1 w-[calc(100%-184px)] -translate-x-1/2 transform bg-black/20`}
      >
        <div
          className="h-1 bg-black transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepsBar;
