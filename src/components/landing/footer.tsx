import Link from "next/link";
import { CarFront, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { IconBrandFacebook, IconBrandInstagram, IconBrandX, IconBrandYoutube } from "@tabler/icons-react";
import Image from "next/image";
import type { SiteConfig } from "@/app/dashboard/site-config/types";

const colAccents = [
  { bar: "from-amber-400 to-orange-500", hover: "group-hover:text-amber-400" },
  { bar: "from-cyan-400 to-sky-500",    hover: "group-hover:text-cyan-400" },
  { bar: "from-violet-400 to-purple-500", hover: "group-hover:text-violet-400" },
];

type FooterProps = {
  siteName?: string;
  tagline?: string;
  location?: string;
  logoUrl?: string;
} & Partial<Pick<SiteConfig,
  | "footerCol1Heading" | "footerCol1Link1Label" | "footerCol1Link1Url"
  | "footerCol1Link2Label" | "footerCol1Link2Url" | "footerCol1Link3Label" | "footerCol1Link3Url"
  | "footerCol1Link4Label" | "footerCol1Link4Url"
  | "footerCol2Heading" | "footerCol2Link1Label" | "footerCol2Link1Url"
  | "footerCol2Link2Label" | "footerCol2Link2Url" | "footerCol2Link3Label" | "footerCol2Link3Url"
  | "footerCol2Link4Label" | "footerCol2Link4Url"
  | "footerCol3Heading" | "footerCol3Link1Label" | "footerCol3Link1Url"
  | "footerCol3Link2Label" | "footerCol3Link2Url" | "footerCol3Link3Label" | "footerCol3Link3Url"
  | "footerCol3Link4Label" | "footerCol3Link4Url"
  | "footerFacebookUrl" | "footerInstagramUrl" | "footerTwitterUrl" | "footerYoutubeUrl"
  | "footerPoweredByText"
>>;

export function Footer({
  siteName = "TourVibe",
  tagline = "Premium car tour management for modern travelers. Experience the island like never before.",
  location = "Ireland, EU",
  logoUrl,
  footerCol1Heading = "Services",
  footerCol1Link1Label = "City Tours", footerCol1Link1Url = "#",
  footerCol1Link2Label = "Airport Transfers", footerCol1Link2Url = "#",
  footerCol1Link3Label = "Corporate Travel", footerCol1Link3Url = "#",
  footerCol1Link4Label = "Private Chauffeur", footerCol1Link4Url = "#",
  footerCol2Heading = "Company",
  footerCol2Link1Label = "About Us", footerCol2Link1Url = "/#about",
  footerCol2Link2Label = "Our Fleet", footerCol2Link2Url = "#",
  footerCol2Link3Label = "Blog", footerCol2Link3Url = "/blog",
  footerCol2Link4Label = "Reviews", footerCol2Link4Url = "/#reviews",
  footerCol3Heading = "Support",
  footerCol3Link1Label = "Help Center", footerCol3Link1Url = "#",
  footerCol3Link2Label = "Terms of Service", footerCol3Link2Url = "#",
  footerCol3Link3Label = "Privacy Policy", footerCol3Link3Url = "#",
  footerCol3Link4Label = "Safety", footerCol3Link4Url = "#",
  footerFacebookUrl = "",
  footerInstagramUrl = "",
  footerTwitterUrl = "",
  footerYoutubeUrl = "",
  footerPoweredByText = "Powered by TourVibe",
}: FooterProps) {
  const columns = [
    {
      heading: footerCol1Heading,
      links: [
        { label: footerCol1Link1Label, href: footerCol1Link1Url },
        { label: footerCol1Link2Label, href: footerCol1Link2Url },
        { label: footerCol1Link3Label, href: footerCol1Link3Url },
        { label: footerCol1Link4Label, href: footerCol1Link4Url },
      ],
    },
    {
      heading: footerCol2Heading,
      links: [
        { label: footerCol2Link1Label, href: footerCol2Link1Url },
        { label: footerCol2Link2Label, href: footerCol2Link2Url },
        { label: footerCol2Link3Label, href: footerCol2Link3Url },
        { label: footerCol2Link4Label, href: footerCol2Link4Url },
      ],
    },
    {
      heading: footerCol3Heading,
      links: [
        { label: footerCol3Link1Label, href: footerCol3Link1Url },
        { label: footerCol3Link2Label, href: footerCol3Link2Url },
        { label: footerCol3Link3Label, href: footerCol3Link3Url },
        { label: footerCol3Link4Label, href: footerCol3Link4Url },
      ],
    },
  ];

  const socials = [
    { url: footerFacebookUrl,  Icon: IconBrandFacebook,  label: "Facebook" },
    { url: footerInstagramUrl, Icon: IconBrandInstagram, label: "Instagram" },
    { url: footerTwitterUrl,   Icon: IconBrandX,         label: "Twitter / X" },
    { url: footerYoutubeUrl,   Icon: IconBrandYoutube,   label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(ellipse 100% 60% at 15% 0%, rgba(245,158,11,0.12) 0%, transparent 50%)," +
          "radial-gradient(ellipse 80% 50% at 85% 30%, rgba(139,92,246,0.14) 0%, transparent 50%)," +
          "radial-gradient(ellipse 70% 40% at 50% 100%, rgba(6,182,212,0.09) 0%, transparent 55%)," +
          "#020617",
      }}
    >
      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Color orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 size-[420px] rounded-full bg-amber-500/12 blur-[100px]" />
        <div className="absolute top-10 right-1/5 size-[380px] rounded-full bg-violet-500/14 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 size-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-10 left-0 size-64 rounded-full bg-indigo-500/8 blur-3xl" />
      </div>

      {/* Top gradient bar */}
      <div className="relative h-px w-full bg-gradient-to-r from-amber-400 via-violet-500 to-cyan-500" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand column */}
          <div className="col-span-1 space-y-5 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative flex size-9 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-amber-400/30 transition-transform duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500" />
                {logoUrl ? (
                  <Image src={logoUrl} alt={siteName} width={36} height={36} className="relative object-cover" />
                ) : (
                  <CarFront className="relative size-5 text-white" />
                )}
              </div>
              <span className="font-heading text-xl font-extrabold tracking-tight">{siteName}</span>
            </Link>

            <p className="text-sm leading-7 text-white/50">{tagline}</p>

            {/* Location pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/50 transition-colors hover:border-white/15 hover:text-white/60">
              <MapPin className="size-3.5 text-amber-400" />
              {location}
            </div>

            {/* Social links */}
            {socials.length > 0 && (
              <div className="flex items-center gap-2">
                {socials.map(({ url, Icon, label }) => (
                  <Link
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/80"
                  >
                    <Icon className="size-3.5" />
                  </Link>
                ))}
              </div>
            )}

            {/* Powered by badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-3 py-1.5 text-[11px] font-semibold text-indigo-300/70">
              <Sparkles className="size-3 text-indigo-400" />
              {footerPoweredByText}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col, colIdx) => (
            <div key={col.heading} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`h-0.5 w-4 rounded-full bg-gradient-to-r ${colAccents[colIdx].bar}`} />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  {col.heading}
                </h3>
              </div>
              <ul className="space-y-3">
                {col.links.filter((l) => l.label).map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href || "#"}
                      className="group inline-flex items-center gap-1.5 text-sm text-white/50 transition-all hover:text-white"
                    >
                      <ArrowRight className={`size-3 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 ${colAccents[colIdx].hover}`} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-amber-400 via-violet-500 to-cyan-400 opacity-60" />
            <div className="h-0.5 w-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-30" />
          </div>
        </div>
      </div>
    </footer>
  );
}
