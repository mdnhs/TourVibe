import type { Metadata } from "next";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ensureSeededSuperAdmin } from "@/lib/seed";
import "./globals.css";

export const metadata: Metadata = {
  title: "TourVibe | Car Tour Management",
  description:
    "Car-based tour management platform with Better Auth, SQLite, shadcn UI and RBAC roles.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureSeededSuperAdmin();

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
