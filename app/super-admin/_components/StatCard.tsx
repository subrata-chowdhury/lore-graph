import React from "react";
import { BiUser } from "react-icons/bi";

export type StatCardProps = {
  name: string;
  icon: React.ReactNode;
  value: string | number;
  percentageChange: string;
  timeframe: string;
  loading?: boolean;
};

const StatCard = ({
  name,
  icon,
  value,
  percentageChange = "0%",
  timeframe = "Since last month",
  loading = false,
}: StatCardProps) => {
  return (
    <div className="inline-flex flex-col rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center gap-2 pb-6">
        {icon}
        {name}
      </div>
      <div className="flex justify-between">
        <div className="pr-6 text-[48px] leading-none font-bold">
          {!loading && value}
          {loading && <div className="h-12 w-24 animate-pulse rounded bg-gray-200"></div>}
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <div
            className={`${percentageChange.startsWith("-") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"} ${loading ? "animate-pulse" : ""} ms-auto rounded-full px-2 py-1 text-xs font-semibold`}
          >
            {!loading && percentageChange}
            {loading && <div className="h-3 w-10"></div>}
          </div>
          <div className="text-xs text-gray-500">{timeframe}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
