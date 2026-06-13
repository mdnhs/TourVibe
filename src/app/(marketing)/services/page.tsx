import type { Metadata } from "next";
import { getSeoSettingsSync, buildMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/app/dashboard/site-config/actions";
import { Services } from "@/components/landing/services";
import { Contact } from "@/components/landing/contact";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettingsSync();
  return buildMetadata(s, {
    title: "Our Services",
    description: "Explore the full range of car tour services we offer — scenic drives, airport transfers, private charters, and more.",
    canonical: "/services",
  });
}

export default async function ServicesPage() {
  const siteConfig = await getSiteConfig();

  const services = [
    { title: siteConfig.service1Title, description: siteConfig.service1Description, icon: siteConfig.service1Icon },
    { title: siteConfig.service2Title, description: siteConfig.service2Description, icon: siteConfig.service2Icon },
    { title: siteConfig.service3Title, description: siteConfig.service3Description, icon: siteConfig.service3Icon },
    { title: siteConfig.service4Title, description: siteConfig.service4Description, icon: siteConfig.service4Icon },
    { title: siteConfig.service5Title, description: siteConfig.service5Description, icon: siteConfig.service5Icon },
  ];

  const od = (v?: string) => (v && v.trim() ? v : undefined);

  return (
    <div className="min-h-screen text-slate-900">
      {/* Page Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 px-4 py-24 sm:px-6 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/60 animate-in fade-in duration-500">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-violet-300" />
            </span>
            What We Offer
          </div>

          <h1
            className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-white sm:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "80ms" }}
          >
            Our{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Services
              </span>
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-amber-400/50 to-orange-400/50" aria-hidden="true" />
            </span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            From scenic coastal drives to private airport transfers — we handle every detail so you can focus on the experience.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <Services
        services={services}
        badgeText={od(siteConfig.servicesBadgeText)}
        sectionTitle={od(siteConfig.servicesSectionTitle)}
        sectionHighlight={od(siteConfig.servicesSectionHighlight)}
        sectionSubtitle={od(siteConfig.servicesSectionSubtitle)}
      />

      {/* Contact CTA */}
      <Contact
        email={od(siteConfig.contactEmail)}
        phone={od(siteConfig.contactPhone)}
        location={od(siteConfig.contactLocation)}
      />
    </div>
  );
}
