import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getSeoSettingsSync, buildMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/app/dashboard/site-config/actions";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettingsSync();
  return buildMetadata(s, { canonical: "/" });
}
import { Hero } from "@/components/landing/hero";
import { PopularTours } from "@/components/landing/popular-tours";
import { PopularCars } from "@/components/landing/popular-cars";
import { Services } from "@/components/landing/services";
import { LiveTrackingSection } from "@/components/landing/live-tracking";
import { About } from "@/components/landing/about";
import { Reviews } from "@/components/landing/reviews";
import { BlogPreview } from "@/components/landing/blog-preview";
import { Contact } from "@/components/landing/contact";
import type { DriverLocation } from "@/app/api/drivers/locations/route";

export default async function Home() {
  const siteConfig = await getSiteConfig();

  // Fetch real-time statistics
  const [tourCount, reviewCount, avgRatingResult, vehicleCount, touristCount] = await Promise.all([
    db.tourPackage.count(),
    db.review.count(),
    db.review.aggregate({
      _avg: {
        rating: true,
      },
    }),
    db.vehicle.count(),
    db.user.count({
      where: { role: "tourist" },
    }),
  ]);

  const statsData = {
    tourCount,
    reviewCount,
    avgRating: Number(avgRatingResult._avg.rating || 0),
    vehicleCount,
    touristCount,
  };

  // Fetch dynamic reviews
  const dynamicReviewsRaw = await db.review.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          role: true,
          image: true,
        },
      },
    },
  });

  const dynamicReviews = dynamicReviewsRaw.map((r) => {
    const isAdmin = r.user.role === "super_admin" || r.user.role === "admin";
    
    return {
      quote: r.comment || "",
      // If admin: strictly use reviewerName or fallback to generic. Never use user.name.
      name: isAdmin 
        ? (r.reviewerName || "Happy Traveler") 
        : (r.reviewerName || r.user.name),
      // If admin: strictly use reviewerImage or null. Never use user.image.
      image: isAdmin 
        ? r.reviewerImage 
        : (r.reviewerImage || r.user.image),
      role: isAdmin ? "Tourist" : (r.user.role === "tourist" ? "Tourist" : r.user.role.replace("_", " ")),
      rating: r.rating,
    };
  });

  // Fallback if no reviews exist
  const displayReviews =
    dynamicReviews.length > 0
      ? dynamicReviews.map((r) => ({
          quote: r.quote,
          name: r.name,
          image: r.image,
          role: r.role,
        }))
      : [
          {
            quote:
              "Everything felt polished, from the airport pickup to the hill-view stopovers. The driver updates were especially useful.",
            name: "Mila Fernandes",
            role: "Tourist from Lisbon",
          },
          {
            quote:
              "Our family trip through the Wild Atlantic Way was flawless — the driver knew every hidden gem along the route.",
            name: "Rafid Hasan",
            role: "Family traveler from Dhaka",
          },
          {
            quote:
              "The itinerary looked premium and the transport was punctual. It felt like a proper guided road experience.",
            name: "Ethan Blake",
            role: "Weekend traveler",
          },
        ];

  // Fetch popular tours with avg rating and review count
  interface PopularTourRaw {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: string;
    maxPersons: number;
    thumbnail: string;
    avgRating: number | null;
    reviewCount: bigint;
  }

  const popularToursRaw = (await db.$queryRaw`
    SELECT
      tp.id, tp.name, tp.description, tp.price, tp.duration, "tp"."maxPersons", tp.thumbnail,
      AVG(r.rating) as "avgRating",
      COUNT(r.id) as "reviewCount"
    FROM tour_package tp
    LEFT JOIN review r ON r."tourPackageId" = tp.id
    GROUP BY tp.id
    ORDER BY "reviewCount" DESC, tp."createdAt" DESC
    LIMIT 6
  `) as PopularTourRaw[];

  const popularTours = popularToursRaw.map(t => ({
    ...t,
    reviewCount: Number(t.reviewCount),
    avgRating: t.avgRating ? Number(t.avgRating) : null,
    price: Number(t.price),
  }));

  // Fetch popular cars ordered by tour appearances
  interface PopularCarRaw {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    thumbnail: string;
    tourCount: bigint;
  }

  const popularCarsRaw = (await db.$queryRaw`
    SELECT
      v.id, v.make, v.model, v.year, v."licensePlate", v.thumbnail,
      COUNT(tpv."tourPackageId") as "tourCount"
    FROM vehicle v
    LEFT JOIN tour_package_vehicle tpv ON tpv."vehicleId" = v.id
    GROUP BY v.id
    ORDER BY "tourCount" DESC, v."createdAt" DESC
    LIMIT 6
  `) as PopularCarRaw[];

  const popularCars = popularCarsRaw.map(c => ({
    ...c,
    tourCount: Number(c.tourCount),
  }));

  // Live driver locations for tracking section
  const liveDriversRaw = await db.user.findMany({
    where: {
      role: "driver",
      lat: { not: null },
      lng: { not: null },
    },
    include: {
      vehicles: {
        take: 1,
        select: {
          make: true,
          model: true,
          licensePlate: true,
        },
      },
    },
    orderBy: {
      locationUpdatedAt: "desc",
    },
  });

  const liveDrivers: DriverLocation[] = liveDriversRaw.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    lat: Number(u.lat!),
    lng: Number(u.lng!),
    locationName: u.locationName,
    locationUpdatedAt: u.locationUpdatedAt?.toISOString() || null,
    vehicleMake: u.vehicles[0]?.make || null,
    vehicleModel: u.vehicles[0]?.model || null,
    vehicleLicense: u.vehicles[0]?.licensePlate || null,
  }));

  const services = [
    { title: siteConfig.service1Title, description: siteConfig.service1Description, icon: siteConfig.service1Icon },
    { title: siteConfig.service2Title, description: siteConfig.service2Description, icon: siteConfig.service2Icon },
    { title: siteConfig.service3Title, description: siteConfig.service3Description, icon: siteConfig.service3Icon },
    { title: siteConfig.service4Title, description: siteConfig.service4Description, icon: siteConfig.service4Icon },
    { title: siteConfig.service5Title, description: siteConfig.service5Description, icon: siteConfig.service5Icon },
  ];

  const stats = [
    { label: "Tour Packages", value: `${statsData.tourCount}+` },
    { label: "Fleet Vehicles", value: `${statsData.vehicleCount}+` },
    { label: "Happy Travelers", value: `${statsData.touristCount}+` },
    { label: "Guest Reviews", value: `${statsData.reviewCount}+` },
  ];

  const activeTour = popularTours.length > 0 ? {
    name: popularTours[0].name,
    duration: popularTours[0].duration,
    avgRating: popularTours[0].avgRating,
    reviewCount: popularTours[0].reviewCount,
    price: popularTours[0].price,
  } : undefined;

  const blogPosts = await db.blogPost.findMany({
    where: { status: "published" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      authorName: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    take: 3,
  });

  return (
    <div className="min-h-screen text-slate-900">
      <Hero
        stats={stats}
        initialDrivers={liveDrivers}
        activeTour={activeTour}
        heroImage={siteConfig.heroImage}
        badgeText={siteConfig.heroBadgeText}
        heroTitle={siteConfig.heroTitle}
        heroTitleHighlight={siteConfig.heroTitleHighlight}
        heroSubtitle={siteConfig.heroSubtitle}
        popularTags={[
          { label: siteConfig.heroTag1Label, emoji: siteConfig.heroTag1Emoji, url: siteConfig.heroTag1Url },
          { label: siteConfig.heroTag2Label, emoji: siteConfig.heroTag2Emoji, url: siteConfig.heroTag2Url },
          { label: siteConfig.heroTag3Label, emoji: siteConfig.heroTag3Emoji, url: siteConfig.heroTag3Url },
        ]}
      />

      <PopularTours tours={popularTours} />

      <PopularCars cars={popularCars} />

      <Services
        services={services}
        badgeText={siteConfig.servicesBadgeText}
        sectionTitle={siteConfig.servicesSectionTitle}
        sectionHighlight={siteConfig.servicesSectionHighlight}
        sectionSubtitle={siteConfig.servicesSectionSubtitle}
      />

      <LiveTrackingSection initialDrivers={liveDrivers} />

      <About
        title={siteConfig.aboutTitle}
        titleHighlight={siteConfig.aboutTitleHighlight}
        description={siteConfig.aboutDescription}
        stats={[
          { value: siteConfig.aboutStat1Value, label: siteConfig.aboutStat1Label },
          { value: siteConfig.aboutStat2Value, label: siteConfig.aboutStat2Label },
          { value: siteConfig.aboutStat3Value, label: siteConfig.aboutStat3Label },
        ]}
      />

      <Reviews reviews={displayReviews} />

      <BlogPreview posts={blogPosts} />

      <Contact
        email={siteConfig.contactEmail}
        phone={siteConfig.contactPhone}
        location={siteConfig.contactLocation}
      />
    </div>
  );
}
