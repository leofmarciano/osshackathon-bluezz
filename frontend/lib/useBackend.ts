import { useAuth } from "@clerk/clerk-react";
import backend from "~backend/client";

// Returns a backend client configured to send the Clerk session token.
export function useBackend() {
  const { getToken, isSignedIn } = useAuth();

  if (!isSignedIn) return backend;

  return backend.with({
    auth: async () => {
      const token = await getToken();
      if (!token) return null;
      return { authorization: `Bearer ${token}` };
    },
  });
}
