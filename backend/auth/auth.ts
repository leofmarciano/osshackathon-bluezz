import { createClerkClient, verifyToken } from "@clerk/backend";
import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";

const clerkSecretKey = secret("ClerkSecretKey");
const clerkClient = createClerkClient({ secretKey: clerkSecretKey() });

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  imageUrl?: string;
  email?: string | null;
}

// Configure authorized parties for token verification.
// Include all possible domains where the frontend might be deployed
const AUTHORIZED_PARTIES = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://vaquinha-social-frontend-d2r21j482vjq7vd7ksug.lp.dev",
  // Add common Leap deployment patterns
  "https://*.lp.dev",
  // Add localhost variants
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const auth = authHandler<AuthParams, AuthData>(async (data) => {
  const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
  if (!token) {
    throw APIError.unauthenticated("missing token");
  }

  try {
    const verifiedToken = await verifyToken(token, {
      authorizedParties: AUTHORIZED_PARTIES,
      secretKey: clerkSecretKey(),
    });

    const user = await clerkClient.users.getUser(verifiedToken.sub);
    return {
      userID: user.id,
      imageUrl: user.imageUrl,
      email: user.emailAddresses?.[0]?.emailAddress ?? null,
    };
  } catch (err) {
    console.error("Token verification failed:", err);
    throw APIError.unauthenticated("invalid token", err as Error);
  }
});

// Configure the API gateway to use the auth handler.
export const gw = new Gateway({ authHandler: auth });
