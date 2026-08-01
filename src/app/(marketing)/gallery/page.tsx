import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "Media Gallery | TourVibe",
  description: "Explore photos and videos of breathtaking destinations, premium tour vehicles, and unforgettable travel moments with TourVibe.",
};

export default async function PublicGalleryPage() {
  const items = (prisma as any).galleryItem
    ? await prisma.galleryItem.findMany({
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div className="relative overflow-hidden">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-0 right-1/4 size-80 rounded-full bg-cyan-300/8 blur-3xl" />
      </div>

      {/* ── Page header ── */}
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 animate-in fade-in slide-in-from-left-4 duration-500">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-cyan-600" />
            </span>
            Gallery
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1
              className="font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Visual{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Highlights</span>
                <span
                  className="absolute -bottom-0.5 sm:-bottom-1 left-0 h-1 sm:h-1.25 w-full rounded-full bg-amber-400/60"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <div
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 shadow-xs animate-in fade-in slide-in-from-right-4 duration-500"
              style={{ animationDelay: "120ms" }}
            >
              <span className="font-heading text-base font-extrabold text-slate-950 sm:text-lg">{items.length}</span>
              <span className="text-[10px] font-medium text-slate-400 sm:text-xs">media found</span>
            </div>
          </div>

          <p className="max-w-2xl text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Immerse yourself in our collection of tour destinations, luxury vehicles, and real traveler experiences across Ireland and beyond.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <GalleryClient items={items} />
      </main>
    </div>
  );
}
