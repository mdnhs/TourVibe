import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { SeoSettings } from "@/app/dashboard/seo/actions";

const defaults: SeoSettings = {
  siteTitle: "TourVibe",
  titleTemplate: "%s | TourVibe",
  description: "Car-based tour management platform offering scenic road tours, airport transfers, and custom itineraries.",
  keywords: "car tour, road trip, scenic tours, airport transfer, tour management",
  siteUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogSiteName: "TourVibe",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterSite: "",
  twitterCreator: "",
  twitterImage: "",
  robotsIndex: true,
  robotsFollow: true,
  googleAnalyticsId: "",
  googleTagManagerId: "",
  metaPixelId: "",
  facebookCatalogUrl: "/api/feeds/facebook",
  googleSiteVerification: "",
  bingSiteVerification: "",
  yandexVerification: "",
  orgName: "TourVibe",
  orgLogo: "",
  enableJsonLd: true,
};

export async function getSeoSettingsSync(): Promise<SeoSettings> {
  const row = await prisma.settings.findUnique({ where: { key: "seo" } });
  if (!row) return defaults;
  return { ...defaults, ...JSON.parse(row.value) };
}

export function buildMetadata(
  s: SeoSettings,
  override: {
    title?: string;
    description?: string;
    image?: string;
    canonical?: string;
    type?: "website" | "article";
    noIndex?: boolean;
  } = {}
): Metadata {
  const title = override.title
    ? s.titleTemplate.replace("%s", override.title)
    : s.siteTitle;

  const description = override.description || s.description;
  const image = override.image || s.ogImage || undefined;
  const canonical = override.canonical
    ? (s.siteUrl ? `${s.siteUrl}${override.canonical}` : override.canonical)
    : s.siteUrl || undefined;
  const ogTitle = s.ogTitle || title;
  const ogDescription = s.ogDescription || description;
  const noIndex = override.noIndex ?? !s.robotsIndex;
  const noFollow = !s.robotsFollow;

  const meta: Metadata = {
    title,
    description,
    keywords: s.keywords || undefined,
    metadataBase: s.siteUrl ? new URL(s.siteUrl) : undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: { index: !noIndex, follow: !noFollow },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: s.ogSiteName || s.siteTitle,
      type: (override.type || s.ogType || "website") as "website" | "article",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: {
      card: (s.twitterCard as "summary" | "summary_large_image" | "app") || "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(s.twitterSite ? { site: s.twitterSite } : {}),
      ...(s.twitterCreator ? { creator: s.twitterCreator } : {}),
      ...(s.twitterImage || image ? { images: [s.twitterImage || image!] } : {}),
    },
    verification: {
      ...(s.googleSiteVerification ? { google: s.googleSiteVerification } : {}),
      ...(s.bingSiteVerification ? { other: { "msvalidate.01": s.bingSiteVerification } } : {}),
      ...(s.yandexVerification ? { yandex: s.yandexVerification } : {}),
    },
  };

  return meta;
}

export function buildOrganizationSchema(s: SeoSettings) {
  if (!s.enableJsonLd) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.orgName || s.siteTitle,
    url: s.siteUrl || undefined,
    ...(s.orgLogo ? { logo: s.orgLogo } : {}),
  };
}

export function buildWebSiteSchema(s: SeoSettings) {
  if (!s.enableJsonLd || !s.siteUrl) return null;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: s.siteTitle,
    url: s.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${s.siteUrl}/tours?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBlogPostSchema(
  s: SeoSettings,
  post: {
    title: string;
    excerpt: string | null;
    coverImage: string;
    authorName: string;
    publishedAt: string | null;
    slug: string;
  }
) {
  if (!s.enableJsonLd) return null;
  const url = s.siteUrl ? `${s.siteUrl}/blog/${post.slug}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImage || undefined,
    author: { "@type": "Person", name: post.authorName },
    datePublished: post.publishedAt || undefined,
    url,
  };
}

export function buildTourSchema(
  s: SeoSettings,
  tour: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: string;
    thumbnail: string;
    avgRating: number | null;
    reviewCount: number;
  },
  currency?: string,
) {
  if (!s.enableJsonLd) return null;
  const url = s.siteUrl ? `${s.siteUrl}/tours/${tour.id}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: tour.name,
    description: tour.description || undefined,
    ...(url ? { url } : {}),
    ...(tour.thumbnail ? { image: tour.thumbnail } : {}),
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: (currency || "usd").toUpperCase(),
      availability: "https://schema.org/InStock",
    },
    ...(tour.reviewCount > 0 && tour.avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: tour.avgRating.toFixed(1),
            reviewCount: tour.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}
