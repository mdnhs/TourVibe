import type { Metadata } from "next";
import { getSeoSettingsSync, buildMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/app/dashboard/site-config/actions";
import { db } from "@/lib/db";
import { About } from "@/components/landing/about";
import { Reviews } from "@/components/landing/reviews";
import { Contact } from "@/components/landing/contact";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettingsSync();
  return buildMetadata(s, {
    title: "About Us",
    description: "Learn about our story, our team, and our passion for car-based tours.",
    canonical: "/about",
  });
}

export default async function AboutPage() {
  const siteConfig = await getSiteConfig();

  const dynamicReviewsRaw = await db.review.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, role: true, image: true } },
    },
  });

  const reviews = dynamicReviewsRaw.map((r) => {
    const isAdmin = r.user.role === "super_admin" || r.user.role === "admin";
    return {
      quote: r.comment || "",
      name: isAdmin ? (r.reviewerName || "Happy Traveler") : (r.reviewerName || r.user.name),
      image: isAdmin ? r.reviewerImage : (r.reviewerImage || r.user.image),
      role: isAdmin ? "Tourist" : (r.user.role === "tourist" ? "Tourist" : (r.user.role?.replace("_", " ") ?? "Tourist")),
      rating: r.rating,
      photos: (r.photos ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    };
  });

  const displayReviews = reviews.length > 0 ? reviews : [
    { quote: "Everything felt polished, from the airport pickup to the hill-view stopovers.", name: "Mila Fernandes", role: "Tourist from Lisbon" },
    { quote: "Our family trip was flawless — the driver knew every hidden gem along the route.", name: "Rafid Hasan", role: "Family traveler from Dhaka" },
    { quote: "The itinerary looked premium and the transport was punctual.", name: "Ethan Blake", role: "Weekend traveler" },
  ];

  const od = (v?: string) => (v && v.trim() ? v : undefined);

  const aboutStats = [
    { value: siteConfig.aboutStat1Value, label: siteConfig.aboutStat1Label },
    { value: siteConfig.aboutStat2Value, label: siteConfig.aboutStat2Label },
    { value: siteConfig.aboutStat3Value, label: siteConfig.aboutStat3Label },
  ].filter((s) => s.value.trim() || s.label.trim());

  return (
    <div className="min-h-screen text-slate-900">
      {/* Page Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 px-4 py-24 sm:px-6 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/60 animate-in fade-in duration-500">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-violet-300" />
            </span>
            Our Story
          </div>

          <h1
            className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-white sm:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "80ms" }}
          >
            About{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {siteConfig.siteName || "Us"}
              </span>
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-amber-400/50 to-orange-400/50" aria-hidden="true" />
            </span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            {od(siteConfig.aboutDescription) ?? "We believe the real destination is best discovered from the window of a car — not a tour bus."}
          </p>
        </div>
      </section>

      {/* About section */}
      <About
        title={od(siteConfig.aboutTitle)}
        titleHighlight={od(siteConfig.aboutTitleHighlight)}
        description={od(siteConfig.aboutDescription)}
        stats={aboutStats.length ? aboutStats : undefined}
      />

      {/* Reviews */}
      <Reviews reviews={displayReviews} />

      {/* Contact */}
      <Contact
        email={od(siteConfig.contactEmail)}
        phone={od(siteConfig.contactPhone)}
        location={od(siteConfig.contactLocation)}
      />
    </div>
  );
}
