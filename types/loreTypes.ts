export type LoreType = {
  _id: string;
  src?: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  tags: string[];
  type: "video" | "youtube" | "post";
  viewsCount: number;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  visibility: "public" | "private";
  // next: string[]; // Array of Lore IDs
  createdBy: string; // Reference to User (Indexed)
  createdById: string; // Reference to User ID (Indexed)
  createdAt: string;
  updatedAt: string;
};

export type LoreLikeType = {
  _id: string;
  loreId: string; // Reference to Lore (Indexed)
  userId: string; // Reference to User (Indexed)
  createdAt: string;
  updatedAt: string;
};

export type LoreDislikeType = {
  _id: string;
  loreId: string; // Reference to Lore (Indexed)
  userId: string; // Reference to User (Indexed)
  createdAt: string;
  updatedAt: string;
};

export type LoreViewType = {
  _id: string;
  loreId: string; // Reference to Lore (Indexed)
  userId: string | null; // Reference to User (Indexed) or null for anonymous views
  createdAt: string;
  updatedAt: string;
};
