import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface UserInfo {
  id: string;
  email: string | null;
  imageUrl: string;
}

// Returns the authenticated user's basic profile information.
export const getMe = api<void, UserInfo>(
  { expose: true, auth: true, method: "GET", path: "/user/me" },
  async () => {
    const auth = getAuthData()!;
    return {
      id: auth.userID,
      email: auth.email ?? null,
      imageUrl: auth.imageUrl ?? "",
    };
  }
);
