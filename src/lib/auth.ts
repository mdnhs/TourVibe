import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import { ac, roles } from "@/lib/permissions";

const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;
const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  vercelProdUrl ??
  vercelUrl ??
  "http://localhost:3000";
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  "tourvibe-dev-secret-change-me-please-replace-2026";

const trustedOrigins = Array.from(
  new Set(
    [
      appUrl,
      vercelProdUrl,
      vercelUrl,
      "https://tour-vibe.vercel.app",
      "http://localhost:3000",
    ].filter(Boolean) as string[]
  )
);

export const auth = betterAuth({
  appName: "TourVibe",
  baseURL: appUrl,
  secret: authSecret,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "tourist",
      bannedUserMessage:
        "Your account has been suspended. Please contact TourVibe support.",
    }),
  ],
});
