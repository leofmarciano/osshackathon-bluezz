// The Clerk publishable key, to initialize Clerk.
// TODO: Set this to your Clerk publishable key, which can be found in the Clerk dashboard.
export const clerkPublishableKey = "pk_test_d2lubmluZy1wYW5nb2xpbi02My5jbGVyay5hY2NvdW50cy5kZXYk";

// Supported languages
export const supportedLanguages = ['pt', 'en'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

// Default language
export const defaultLanguage: SupportedLanguage = 'pt';
