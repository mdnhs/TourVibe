import type { Metadata } from "next";
import { getSeoSettingsSync, buildMetadata } from "@/lib/seo";
import { CustomTourForm } from "./custom-tour-form";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettingsSync();
  return buildMetadata(s, {
    title: "Organise Your Own Custom Tour",
    description: "Build your dream custom car tour itinerary across Ireland. Tell us your preferences and we will arrange it for you.",
    canonical: "/custom-tours",
  });
}

export default function CustomToursPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ── Background glows (identical to /tours) ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-0 right-1/4 size-80 rounded-full bg-cyan-300/8 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 pt-14 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 animate-in fade-in slide-in-from-left-4 duration-500 mb-4">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-cyan-600" />
          </span>
          Custom Itinerary
        </div>

        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Organise Your <span className="relative inline-block text-amber-600">Own Tour</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 font-medium leading-relaxed">
          Build your dream itinerary from scratch. Tell us your travel dates, preferred destinations, and group details — we will customize your tour experience!
        </p>
      </div>

      {/* Centered Form Layout */}
      <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <CustomTourForm />
      </div>
    </div>
  );
}
