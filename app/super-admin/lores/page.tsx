"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import fetcher from "@/libs/fetcher";
import Table from "@/ui/components/Table";
import { BiPlus, BiTrash, BiUser, BiVideo } from "react-icons/bi";
import Link from "next/link";
import StatCard from "../_components/StatCard";
import { LoreType } from "@/types/loreTypes";
import numberFormatter from "@/libs/numberFormatter";
import { LuPencil } from "react-icons/lu";
import Modal from "@/ui/components/Modal";
import { CgClose } from "react-icons/cg";
import { toast } from "react-toastify";

const LoresPage = () => {
  const [data, setData] = useState<LoreType[]>([]);
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const navigate = useRouter();

  const fetchLores = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", limit.toString());
    if (search) params.set("search", search);
    if (type && type !== "All") params.set("type", type.toLowerCase());

    const res = await fetcher.get<{
      success: boolean;
      data: LoreType[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/super-admin/lores?${params.toString()}`);

    if (res.status !== 200) {
      setLoading(false);
      return;
    }
    if (res.body?.success) {
      setData(res.body.data);
      setTotalPages(res.body.pagination.totalPages || 1);
      setCurrentPage(res.body.pagination.page);
      setLimit(res.body.pagination.limit);
    }
    setLoading(false);
  }, [type, search, currentPage, limit]);

  useEffect(() => {
    fetchLores();
  }, [type, search, currentPage, limit, fetchLores]);

  async function deleteLore(id: string) {
    if (!window.confirm("Are you sure you want to delete this lore?")) return;
    setLoading(true);
    try {
      const res = await fetcher.delete<
        {},
        {
          success: boolean;
          error?: string;
        }
      >(`/super-admin/lores/${id}`);
      if (res.status === 200 || res.body?.success) {
        toast.success("Lore deleted successfully");
        await fetchLores();
      } else {
        toast.error(res.error || "Failed to delete lore");
      }
    } catch (error) {
      toast.error("Failed to delete lore");
    }
    setLoading(false);
  }

  return (
    <>
      <div className="m-2.5 flex flex-1 flex-col gap-4">
        <Cards />
        <Link
          className="ms-auto flex cursor-pointer items-center gap-1 rounded bg-black/20 px-4 py-2 text-sm font-medium text-black dark:bg-white/15"
          href="/super-admin/lores/create"
        >
          <div>New Lore</div>
          <BiPlus size={16} />
        </Link>
        <Table<LoreType>
          loading={loading}
          table={{
            config: [
              {
                heading: "Title",
                selector: "title",
                component: ({ data }) => (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-14 overflow-hidden rounded bg-gray-200">
                      {data.thumbnailUrl && (
                        <img
                          src={data.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="max-w-50 font-medium">
                      <div className="line-clamp-1 text-sm leading-tight">{data.title}</div>
                      <div className="text-xs text-gray-500 capitalize">{data.type}</div>
                    </div>
                  </div>
                ),
              },
              {
                heading: "Views",
                selector: "viewsCount",
                component: ({ data }) => <div>{numberFormatter(data.viewsCount || 0)}</div>,
              },
              {
                heading: "Likes",
                selector: "likesCount",
                component: ({ data }) => <div>{numberFormatter(data.likesCount || 0)}</div>,
              },
              {
                heading: "Tags",
                selector: "tags",
                hideAble: true,
                component: ({ data, index }) => (
                  <div
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setSelectedRow(index);
                    }}
                  >
                    {data.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="mr-1 rounded-full bg-black/10 px-2.5 py-1 text-nowrap"
                      >
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
                heading: "Visibility",
                selector: "visibility",
                component: ({ data }) => (
                  <span
                    className={`capitalize ${data.visibility === "public" ? "text-green-600" : "text-gray-500"}`}
                  >
                    {data.visibility}
                  </span>
                ),
              },
              {
                heading: "Created By",
                selector: "createdBy",
                component: ({ data }) => (
                  <div>
                    <div className="leading-tight">{data.createdBy}</div>
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
                      onClick={() => navigate.push("/super-admin/lores/" + data._id)}
                    >
                      <LuPencil />
                    </button>
                    <button
                      className="cursor-pointer rounded-full p-2 transition-all hover:bg-black/10"
                      onClick={() => deleteLore(data._id as string)}
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
          onSearch={(val) => setSearch(val)}
          tag={{
            tags: ["All", "Video", "YouTube", "Post"],
            onTagChange: (tag) => {
              setType(tag);
            },
          }}
        />
      </div>
      {selectedRow !== null && (
        <Modal isOpen={selectedRow !== null} onClose={() => setSelectedRow(null)}>
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-2 text-lg font-semibold">
            Tags of lore: {data[selectedRow]?.title}
            <CgClose className="cursor-pointer" onClick={() => setSelectedRow(null)} />
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {data[selectedRow]?.tags?.map((tag) => (
              <span key={tag} className="rounded-full bg-black/10 px-3.5 py-1.5">
                {tag}
              </span>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};

export default LoresPage;

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
        totalLores: { value: 150, percentageChange: "+12%" },
        totalViews: { value: "45K", percentageChange: "+8%" },
        newLores: { value: 25, percentageChange: "+5%" },
        activeCreators: { value: 12, percentageChange: "+2%" },
      });
      setLoading(false);
    }, 1000);
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
    name: "Total Lores",
    icon: <BiVideo size={24} />,
    selector: "totalLores",
    timeframe: "Since last month",
  },
  {
    name: "Total Views",
    icon: <BiUser size={24} />,
    selector: "totalViews",
    timeframe: "Since last month",
  },
  {
    name: "New Lores",
    icon: <BiPlus size={24} />,
    selector: "newLores",
    timeframe: "Since last month",
  },
  {
    name: "Active Creators",
    icon: <BiUser size={24} />,
    selector: "activeCreators",
    timeframe: "Since last month",
  },
];
