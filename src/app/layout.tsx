import type { Metadata } from "next";
import Script from "next/script";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ensureSeededSuperAdmin } from "@/lib/seed";
import { getSeoSettingsSync, buildMetadata, buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";
import { getThemeConfig } from "@/app/dashboard/appearance/actions";
import { buildThemeCss } from "@/lib/theme";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettingsSync();
  return buildMetadata(s);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureSeededSuperAdmin();
  const [s, themeConfig] = await Promise.all([
    getSeoSettingsSync(),
    getThemeConfig(),
  ]);
  const themeCss = buildThemeCss(themeConfig);

  const orgSchema = buildOrganizationSchema(s);
  const webSiteSchema = buildWebSiteSchema(s);
  const schemas = [orgSchema, webSiteSchema].filter(Boolean);

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Dynamic theme CSS — must be synchronous to prevent FOUC */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />

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
        {/* Meta Pixel noscript fallback */}
        {s.metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${s.metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <TooltipProvider>{children}</TooltipProvider>
          </NuqsAdapter>
          <Toaster position="top-center" richColors />
        </ThemeProvider>

        {/* JSON-LD Structured Data — next/script is better outside <head> */}
        {schemas.map((schema, i) => (
          <Script
            key={i}
            id={`schema-${i}`}
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {/* Google Tag Manager */}
        {s.googleTagManagerId && (
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.googleTagManagerId}');`,
            }}
          />
        )}

        {/* Google Analytics 4 */}
        {s.googleAnalyticsId && !s.googleTagManagerId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${s.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.googleAnalyticsId}');`,
              }}
            />
          </>
        )}

        {/* Meta Pixel */}
        {s.metaPixelId && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.metaPixelId}');fbq('track','PageView');`,
            }}
          />
        )}
      </body>
    </html>
  );
}
