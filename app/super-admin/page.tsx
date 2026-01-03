"use client";
import fetcher from "@/libs/fetcher";
import React, { useEffect, useState } from "react";
import { BiUser } from "react-icons/bi";
import StatCard from "./_components/StatCard";

const MainDashboardPage = () => {
  return (
    <div>
      <Cards />
    </div>
  );
};

export default MainDashboardPage;

const Cards = () => {
  const [data, setData] = useState<{
    [key: string]: {
      value: number | string;
      percentageChange: string;
    };
  }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate data fetching
    setLoading(true);
    fetcher.get("/api/super-admin/stats");
    fetcher.get("/api/super-admin/stats");
    fetcher.get("/api/super-admin/stats");
    setTimeout(() => {
      setData({
        totalUsers: { value: 1200, percentageChange: "+5%" },
        activeUsers: { value: 900, percentageChange: "+3%" },
        newSignups: { value: 150, percentageChange: "+10%" },
        churnRate: { value: "2%", percentageChange: "-1%" },
      });
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="m-2.5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.name}
          name={card.name}
          icon={card.icon}
          value={data[card.selector]?.value}
          percentageChange={data[card.selector]?.percentageChange}
          timeframe={card.timeframe}
          loading={loading}
        />
      ))}
    </div>
  );
};

const cards = [
  {
    name: "Total Users",
    icon: <BiUser size={24} />,
    selector: "totalUsers",
    timeframe: "Since last month",
  },
  {
    name: "Active Users",
    icon: <BiUser size={24} />,
    selector: "activeUsers",
    timeframe: "Since last month",
  },
  {
    name: "New Signups",
    icon: <BiUser size={24} />,
    selector: "newSignups",
    timeframe: "Since last month",
  },
  {
    name: "Churn Rate",
    icon: <BiUser size={24} />,
    selector: "churnRate",
    timeframe: "Since last month",
  },
];
