import { useAuth } from "@clerk/clerk-react";
import backend from "~backend/client";

// Returns the backend client with proper authentication.
export function useBackend() {
  const { getToken, isSignedIn } = useAuth();
  
  if (!isSignedIn) {
    return backend;
  }
  
  return backend.with({
    auth: async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No token available");
        }
        return { authorization: `Bearer ${token}` };
      } catch (error) {
        console.error("Failed to get auth token:", error);
        throw error;
      }
    }
  });
}

// Returns whether the user is signed in
export function useIsSignedIn() {
  const { isSignedIn } = useAuth();
  return isSignedIn;
}
