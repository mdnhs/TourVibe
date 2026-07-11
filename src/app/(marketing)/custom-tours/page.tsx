import type { Metadata } from "next";
import { getSeoSettingsSync, buildMetadata } from "@/lib/seo";
import { Clock, Users, MapPin, CheckCircle2 } from "lucide-react";
import { CustomTourForm } from "./custom-tour-form";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettingsSync();
  return buildMetadata(s, {
    title: "Custom Tours & Packages",
    description: "Organize your own custom car tour across Ireland or choose from our special packages.",
    canonical: "/custom-tours",
  });
}

const PACKAGES = [
  {
    name: "Killeaney Package",
    duration: "7 hours",
    price4: "€450",
    price6: "€550",
    highlights: ["Scenic coastal routes", "Historic landmarks", "Flexible stops"],
  },
  {
    name: "Full Cork Tourist Places",
    duration: "6-7 hours",
    price4: "€400",
    price6: "€500",
    highlights: ["Blarney Castle", "Cobh Heritage", "Cork City Center"],
  },
  {
    name: "Classic 4-Hour Tour",
    duration: "4 hours",
    price4: "€200",
    price6: "€250",
    highlights: ["Express sightseeing", "Local attractions", "Photo stops"],
  },
  {
    name: "Premium 4-Hour Tour",
    duration: "4 hours",
    price4: "€250",
    price6: "€300",
    highlights: ["Extended range", "Premium vehicle", "Guided insights"],
  },
  {
    name: "Scenic 4-Hour Tour",
    duration: "4 hours",
    price4: "€250",
    price6: "€300",
    highlights: ["Coastal drives", "Nature spots", "Relaxed pace"],
  },
  {
    name: "Quick Tour Kinsale",
    duration: "3 hours",
    price4: "€200",
    price6: "€250",
    highlights: ["Charles Fort", "Kinsale City", "Old Head Cliff"],
  },
];

export default function CustomToursPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-0 right-1/4 size-80 rounded-full bg-cyan-300/8 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Custom Your <span className="text-amber-500">Tours</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Choose from our carefully curated special packages or build your dream itinerary from scratch. We can do any quick tour — just message us and we'll arrange it as soon as possible!
        </p>
      </div>

      {/* Two Column Layout: Form + Packages */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">

          {/* Column 1: Organise Your Own Tour Form */}
          <div className="order-1 lg:order-1">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Organise Your Own Tour</h2>
            </div>
            <CustomTourForm />
          </div>

          {/* Column 2: Featured Packages */}
          <div className="order-2 lg:order-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured Packages</h2>
              <div className="mt-2 h-1 w-20 bg-amber-400 rounded-full" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {PACKAGES.map((pkg, i) => (
                <div
                  key={i}
                  className="group relative rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 transition-all hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Clock className="size-4" />
                    <span>{pkg.duration}</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Users className="size-4 text-slate-400" />
                        <span className="font-medium text-sm">Up to 4 people</span>
                      </div>
                      <span className="font-bold text-slate-900">{pkg.price4}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Users className="size-4 text-slate-400" />
                        <span className="font-medium text-sm">Up to 6 people</span>
                      </div>
                      <span className="font-bold text-slate-900">{pkg.price6}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Highlights</p>
                    <ul className="space-y-1.5">
                      {pkg.highlights.map((highlight, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
