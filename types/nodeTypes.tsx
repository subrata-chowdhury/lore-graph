export type NodeType = {
  _id: string;
  src?: string;
  title: string;
  description: string;
  tags: string[];
  type: "video" | "youtube" | "post";
  viewsCount: number;
  likesCount: number;
  next: string[]; // Array of Node IDs
  createdBy: string; // Reference to User (Indexed)
  createdAt: string;
  updatedAt: string;
};

export type NodeLikeType = {
  _id: string;
  nodeId: string; // Reference to Node (Indexed)
  userId: string; // Reference to User (Indexed)
  createdAt: string;
  updatedAt: string;
};

export type NodeViewType = {
  _id: string;
  nodeId: string; // Reference to Node (Indexed)
  userId: string | null; // Reference to User (Indexed) or null for anonymous views
  createdAt: string;
  updatedAt: string;
};
