import Link from "next/link";
import { CarFront, MapPin, ArrowRight } from "lucide-react";

const links = {
  Services: ["City Tours", "Airport Transfers", "Corporate Travel", "Private Chauffeur"],
  Company: ["About Us", "Our Fleet", "Reviews", "Contact"],
  Support: ["Help Center", "Terms of Service", "Privacy Policy", "Safety"],
};

const anchors: Record<string, string> = {
  "About Us": "/#about",
  Reviews: "/#reviews",
  Contact: "/#contact",
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-400/6 blur-3xl" />
        <div className="absolute top-0 right-1/4 size-80 rounded-full bg-cyan-400/6 blur-3xl" />
      </div>

      {/* ── Top gradient bar ── */}
      <div className="h-px w-full bg-linear-to-r from-amber-400 via-orange-500 to-cyan-500" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand column */}
          <div className="col-span-1 space-y-5 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 transition-transform duration-300 group-hover:scale-105">
                <CarFront className="size-5" />
              </div>
              <span className="font-heading text-xl font-extrabold tracking-tight">TourVibe</span>
            </Link>

            <p className="text-sm leading-7 text-white/50">
              Premium car tour management for modern travelers. Experience the
              island like never before.
            </p>

            {/* Location pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/50">
              <MapPin className="size-3.5 text-amber-400" />
              Ireland, EU
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items], colIdx) => (
            <div key={heading} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                {heading}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => {
                  const href = anchors[item] ?? "#";
                  return (
                    <li key={item}>
                      <Link
                        href={href}
                        className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white"
                      >
                        <ArrowRight className="size-3 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-amber-400" />
                        {item}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-sm text-white/35">
            © {new Date().getFullYear()} TourVibe. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-0.75 w-8 rounded-full bg-linear-to-r from-amber-400 to-orange-500" />
            <div className="h-0.75 w-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 opacity-40" />
          </div>
        </div>
      </div>
    </footer>
  );
}
