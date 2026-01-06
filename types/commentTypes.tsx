export type CommentType = {
  _id: string;
  loreId: string; // The ID of the video / post this belongs to (INDEX THIS)
  parentId: string | null; // null = top-level comment; ID = reply to another comment
  author: string;
  authorId: string; // Reference to User (Indexed)
  content: string;
  likesCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CommentLikeType = {
  _id: string;
  commentId: string; // Reference to Comment (Indexed)
  userId: string; // Reference to User (Indexed)
  createdAt: string;
};
