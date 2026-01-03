// Backend Types
export type AuthTokenPayloadType = {
  userId: string;
  verified: string;
  ip: string;
  deviceInfo: string;
  language: string;
};

// Frontend
export type PageType = {
  _id: string;
  title: string;
  lvls: {
    id: string;
    title: string;
  }[];
  slug: string;
  description: string;
  tags: string[];
  authorId: string;
  rating: number;
  rated: number;
  views: number;
  bgImgUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};
