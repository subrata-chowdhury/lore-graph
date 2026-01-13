export type UserType = {
  name: string;
  email: string;
  password: string;
  username: string;
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
