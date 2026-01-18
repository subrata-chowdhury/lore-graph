export type UserType = {
  _id?: string;
  name: string;
  email: string;
  password: string;
  username: string;
  about?: string;
  links?: {
    type: "YouTube" | "Twittch" | "Instagram" | "TikTok" | "X" | "Facebook" | "Other";
    url: string;
  }[];
  country?: string;
  followersCount: number;
  followingCount: number;

  verified: boolean;
  otp?: string;
  otpExpiry?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};
