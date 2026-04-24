import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import { ac, roles } from "@/lib/permissions";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  "tourvibe-dev-secret-change-me-please-replace-2026";

export const auth = betterAuth({
  appName: "TourVibe",
  baseURL: appUrl,
  secret: authSecret,
  trustedOrigins: [appUrl],
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
