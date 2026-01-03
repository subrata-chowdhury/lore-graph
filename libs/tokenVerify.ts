import { jwtVerify } from "jose";
import { error } from "node:console";

export default async function verifyToken<T>(
  token: string | undefined | null,
  userType: "super-admin" | "user"
): Promise<false | T> {
  if (token && token !== "") {
    
    try {
      let jwtSecret = null;
      switch (userType) {
        case "super-admin":
          jwtSecret = process.env.SUPER_ADMIN_JWT_SECRET;
          break;
        case "user":
          jwtSecret = process.env.JWT_SECRET;
          break;

        default:
          jwtSecret = process.env.JWT_SECRET;
          break;
      }
      const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
      console.log("Verified payload:", payload);
      return payload as T;
    } catch(error) {
      console.log(error)
      return false;
    }
  }
  return false;
}
