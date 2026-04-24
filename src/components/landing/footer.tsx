import Link from "next/link";
import { CarFront, MapPin, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

const links = {
  Services: ["City Tours", "Airport Transfers", "Corporate Travel", "Private Chauffeur"],
  Company: ["About Us", "Our Fleet", "Blog", "Reviews", "Contact"],
  Support: ["Help Center", "Terms of Service", "Privacy Policy", "Safety"],
};

const anchors: Record<string, string> = {
  "About Us": "/#about",
  Blog: "/blog",
  Reviews: "/#reviews",
  Contact: "/#contact",
};

const colAccents = [
  "group-hover:text-amber-400",
  "group-hover:text-cyan-400",
  "group-hover:text-violet-400",
];

export function Footer({
  siteName = "TourVibe",
  tagline = "Premium car tour management for modern travelers. Experience the island like never before.",
  location = "Ireland, EU",
  logoUrl,
}: {
  siteName?: string;
  tagline?: string;
  location?: string;
  logoUrl?: string;
}) {
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

            {/* Built with badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-3 py-1.5 text-[11px] font-semibold text-indigo-300/70">
              <Sparkles className="size-3 text-indigo-400" />
              Powered by TourVibe
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items], colIdx) => (
            <div key={heading} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`h-0.5 w-4 rounded-full bg-gradient-to-r ${colIdx === 0 ? "from-amber-400 to-orange-500" : colIdx === 1 ? "from-cyan-400 to-sky-500" : "from-violet-400 to-purple-500"}`} />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  {heading}
                </h3>
              </div>
              <ul className="space-y-3">
                {items.map((item) => {
                  const href = anchors[item] ?? "#";
                  const hoverColor = colAccents[colIdx % colAccents.length];
                  return (
                    <li key={item}>
                      <Link
                        href={href}
                        className={`group inline-flex items-center gap-1.5 text-sm text-white/50 transition-all hover:text-white`}
                      >
                        <ArrowRight className={`size-3 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 ${hoverColor}`} />
                        {item}
                      </Link>
                    </li>
                  );
                })}
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
