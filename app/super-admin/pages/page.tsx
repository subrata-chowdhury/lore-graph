"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import fetcher from "@/libs/fetcher";
import Table from "@/ui/components/Table";
import { BiPlus, BiTrash, BiUser } from "react-icons/bi";
import Link from "next/link";
import StatCard from "../_components/StatCard";
import { PageType } from "@/types/types";
import numberFormatter from "@/libs/numberFormatter";
import { LuPencil } from "react-icons/lu";
import Modal from "@/ui/components/Modal";
import { CgClose } from "react-icons/cg";

const Pages = () => {
  const [data, setLabData] = useState<PageType[]>(dummyData);
  const [analytics, setAnalytics] = useState<{ totalLabs: number }>({ totalLabs: 0 });

  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [location, setLocation] = useState("All");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const navigate = useRouter();

  // useEffect(() => {
  //     getAnalytics();
  // }, [])

  const fetchLabs = useCallback(async () => {
    setLoading(true);
    const filterData: { location?: string; name?: string } = { location: location, name: name };
    if (location === "All") delete filterData.location;
    if (name === "") delete filterData.name;

    const res = await fetcher.get<{
      pages: PageType[];
      pagination: { pages: number; currentPage: number; pageSize: number; totalPages: number };
    }>(`/pages?filter=${JSON.stringify(filterData)}&limit=${limit}&page=${currentPage}`);
    if (res.status !== 200) return;
    if (res.body) {
      setLabData(res.body.pages);
      setTotalPages(res.body.pagination.totalPages || 1);
      setCurrentPage(res.body.pagination.currentPage);
      setLimit(res.body.pagination.pageSize);
      setAnalytics({ totalLabs: res.body.pagination.pages });
    }
    setLoading(false);
  }, [location, name, currentPage, limit]);

  useEffect(() => {
    // fetchLabs();
  }, [location, name, currentPage, limit, fetchLabs]);

  // async function getAnalytics() {
  //     const res = await fetcher.get<{ totalLabs: number }>('/labs/analytics');
  //     if (res.status !== 200) return;
  //     if (res.body) {
  //         setAnalytics({
  //             totalLabs: res.body.totalLabs || 0
  //         });
  //     };
  // }

  async function deleteLab(id: string) {
    if (!window.confirm("Are you sure you want to delete this lab?")) return;
    setLoading(true);
    // const res = await fetcher.delete(`/admin/labs/${id}`);
    // if (res.status !== 200) return;
    // await fetchLabs();
  }

  return (
    <>
      <div className="m-2.5 flex flex-1 flex-col gap-4">
        <Cards />
        <Link
          className="ms-auto flex cursor-pointer items-center gap-1 rounded bg-black/20 px-4 py-2 text-sm font-medium text-black dark:bg-white/15"
          href="/super-admin/pages/new"
        >
          <div>New Page</div>
          <BiPlus size={16} />
        </Link>
        <Table<PageType>
          loading={loading}
          table={{
            config: [
              {
                heading: "Name",
                selector: "slug",
                component: ({ data }) => (
                  <div className="font-medium">
                    <div className="leading-tight">{data.title}</div>
                    <div className="text-xs text-gray-500">{data.slug}</div>
                  </div>
                ),
              },
              {
                heading: "Rating",
                selector: "rating",
                component: ({ data }) => (
                  <div className="font-medium">
                    <div className="leading-tight">{data.rating}</div>
                    <div className="text-xs text-gray-500">{numberFormatter(data.rated || 0)}</div>
                  </div>
                ),
              },
              {
                heading: "Tags",
                selector: "tags",
                component: ({ data, index }) => (
                  <div
                    className="text-xs"
                    onClick={() => {
                      setSelectedRow(index);
                    }}
                  >
                    {data.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="mr-1 rounded-full bg-black/10 px-2.5 py-1">
                        {tag}
                      </span>
                    ))}
                    {data.tags.length > 2 && (
                      <span className="mr-1 rounded-full bg-black/10 px-2.5 py-1">
                        +{data.tags.length - 2}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                heading: "Views",
                selector: "views",
                component: ({ data }) => <div>{numberFormatter(data.views || 0)}</div>,
              },
              {
                heading: "Created By",
                selector: "authorId",
                component: ({ data }) => (
                  <div>
                    <div className="leading-tight">{data.authorId}</div>
                    <div className="text-xs text-gray-500">
                      at {new Date(data.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ),
              },
              {
                heading: "Actions",
                component: ({ data }) => (
                  <div className="flex w-fit items-center">
                    <button
                      className="cursor-pointer rounded-full p-2 transition-all hover:bg-black/10"
                      onClick={() => navigate.push("/admin/labs/edit/about/" + data._id)}
                    >
                      <LuPencil />
                    </button>
                    <button
                      className="cursor-pointer rounded-full p-2 transition-all hover:bg-black/10"
                      onClick={() => deleteLab(data._id as string)}
                    >
                      <BiTrash />
                    </button>
                  </div>
                ),
              },
            ],
            data: data,
          }}
          pagination={{ currentPage, totalPages: totalPages, onPageChange: setCurrentPage }}
          limit={{
            limit,
            options: [
              { label: "5", value: 5 },
              { label: "10", value: 10 },
              { label: "20", value: 20 },
            ],
            onLimitChange: (val) => setLimit(val as number),
          }}
          onSearch={(val) => setName(val)}
          tag={{
            tags: ["All", "Today"],
            onTagChange: (tag) => {
              setLocation(tag);
            },
          }}
        />
        {/* dropdown={{ options: ['All', 'Location1', 'Location2', 'Location3'], value: location || 'All', onChange: (value) => { setLocation(value as string) }, width: 100 }} /> */}
      </div>
      {selectedRow !== null && (
        <Modal isOpen={selectedRow !== null} onClose={() => setSelectedRow(null)}>
          {/* Modal content for selected row */}
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-2 text-lg font-semibold">
            Tags of page ID: {data[selectedRow]?._id}
            <CgClose className="cursor-pointer" onClick={() => setSelectedRow(null)} />
          </div>
          <div className="p-4">
            {data[selectedRow]?.tags?.map((tag) => (
              <span key={tag} className="mr-2 rounded-full bg-black/10 px-3.5 py-1.5">
                {tag}
              </span>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};

export default Pages;

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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
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

const dummyData: PageType[] = [
  {
    _id: "1",
    title: "Introduction to Lore Graph",
    lvls: [],
    slug: "introduction-to-lore-graph",
    description: "A beginner's guide to Lore Graph.",
    tags: ["beginner", "guide", "lore-graph"],
    authorId: "admin1",
    rating: 4.5,
    rated: 150,
    views: 2500,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-20"),
  },
  {
    _id: "2",
    title: "Advanced Lore Graph Techniques",
    lvls: [],
    slug: "advanced-lore-graph-techniques",
    description: "Explore advanced techniques in Lore Graph.",
    tags: ["advanced", "techniques"],
    authorId: "admin2",
    rating: 4.8,
    rated: 200,
    views: 10000000,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-15"),
  },
  {
    _id: "2",
    title: "Advanced Lore Graph Techniques",
    lvls: [],
    slug: "advanced-lore-graph-techniques",
    description: "Explore advanced techniques in Lore Graph.",
    tags: ["advanced", "techniques"],
    authorId: "admin2",
    rating: 4.8,
    rated: 200,
    views: 10000000,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-15"),
  },
  {
    _id: "2",
    title: "Advanced Lore Graph Techniques",
    lvls: [],
    slug: "advanced-lore-graph-techniques",
    description: "Explore advanced techniques in Lore Graph.",
    tags: ["advanced", "techniques"],
    authorId: "admin2",
    rating: 4.8,
    rated: 200,
    views: 10000000,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-15"),
  },
  {
    _id: "2",
    title: "Advanced Lore Graph Techniques",
    lvls: [],
    slug: "advanced-lore-graph-techniques",
    description: "Explore advanced techniques in Lore Graph.",
    tags: ["advanced", "techniques"],
    authorId: "admin2",
    rating: 4.8,
    rated: 200,
    views: 10000000,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-15"),
  },
  {
    _id: "2",
    title: "Advanced Lore Graph Techniques",
    lvls: [],
    slug: "advanced-lore-graph-techniques",
    description: "Explore advanced techniques in Lore Graph.",
    tags: ["advanced", "techniques"],
    authorId: "admin2",
    rating: 4.8,
    rated: 200,
    views: 10000000,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-15"),
  },
  {
    _id: "2",
    title: "Advanced Lore Graph Techniques",
    lvls: [],
    slug: "advanced-lore-graph-techniques",
    description: "Explore advanced techniques in Lore Graph.",
    tags: ["advanced", "techniques"],
    authorId: "admin2",
    rating: 4.8,
    rated: 200,
    views: 10000000,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-15"),
  },
];
