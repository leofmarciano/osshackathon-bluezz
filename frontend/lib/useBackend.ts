import { useAuth } from "@clerk/clerk-react";
import backend from "../backend";

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
        console.log("Got auth token:", token ? "Token present" : "No token");
        if (!token) {
          console.warn("No auth token available");
          return undefined;
        }
        // Return AuthParams with authorization field directly
        return { 
          authorization: `Bearer ${token}`
        };
      } catch (error) {
        console.error("Failed to get auth token:", error);
        return undefined;
      }
    }
  });
}

// Returns whether the user is signed in
export function useIsSignedIn() {
  const { isSignedIn } = useAuth();
  return isSignedIn;
}
