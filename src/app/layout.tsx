import type { Metadata } from "next";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ensureSeededSuperAdmin } from "@/lib/seed";
import { getSeoSettingsSync, buildMetadata, buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = getSeoSettingsSync();
  return buildMetadata(s);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureSeededSuperAdmin();
  const s = getSeoSettingsSync();

  const orgSchema = buildOrganizationSchema(s);
  const webSiteSchema = buildWebSiteSchema(s);
  const schemas = [orgSchema, webSiteSchema].filter(Boolean);

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Verification meta tags */}
        {s.googleSiteVerification && (
          <meta name="google-site-verification" content={s.googleSiteVerification} />
        )}
        {s.bingSiteVerification && (
          <meta name="msvalidate.01" content={s.bingSiteVerification} />
        )}
        {s.yandexVerification && (
          <meta name="yandex-verification" content={s.yandexVerification} />
        )}

        {/* Google Tag Manager */}
        {s.googleTagManagerId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.googleTagManagerId}');`,
            }}
          />
        )}

        {/* Google Analytics 4 */}
        {s.googleAnalyticsId && !s.googleTagManagerId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${s.googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.googleAnalyticsId}');`,
              }}
            />
          </>
        )}

        {/* JSON-LD Structured Data */}
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* GTM noscript fallback */}
        {s.googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${s.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <TooltipProvider>{children}</TooltipProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
