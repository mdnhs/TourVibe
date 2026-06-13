import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { toursSearchParamsCache } from "./search-params";
import { getSeoSettingsSync, buildMetadata } from "@/lib/seo";
import { getCurrencyCode } from "@/lib/currency-server";
import { ToursList } from "./tours-list";
import { ToursFilter } from "./tours-filter";
import { ToursPagination } from "./tours-pagination";
import { SearchParams } from "nuqs/server";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettingsSync();
  return buildMetadata(s, {
    title: "Tour Packages",
    description: "Browse all available car tour packages — scenic routes, airport transfers, and custom itineraries.",
    canonical: "/tours",
  });
}

interface Tour {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  maxPersons: number;
  thumbnail: string;
  reviewCount: number;
  avgRating: number | null;
  vehicleCount: number;
}

interface ToursPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const { q, minPrice, maxPrice, sort, vehicle, page } = await toursSearchParamsCache.parse(searchParams);
  const PAGE_SIZE = 9;

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (minPrice !== null || maxPrice !== null) {
    where.price = {};
    if (minPrice !== null) where.price.gte = minPrice;
    if (maxPrice !== null) where.price.lte = maxPrice;
  }
  if (vehicle) {
    where.vehicles = { some: { vehicleId: vehicle } };
  }

  const vehicleOptions = (
    await db.vehicle.findMany({
      select: { id: true, make: true, model: true },
      orderBy: [{ make: "asc" }, { model: "asc" }],
    })
  ).map((v) => ({ id: v.id, label: `${v.make} ${v.model}` }));

  const orderBy: any = {};
  if (sort === "price-asc") orderBy.price = "asc";
  else if (sort === "price-desc") orderBy.price = "desc";
  else if (sort === "name-asc") orderBy.name = "asc";
  else orderBy.createdAt = "desc";

  const totalTours = await db.tourPackage.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalTours / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const toursRaw = await db.tourPackage.findMany({
    where,
    orderBy,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: { vehicles: true },
      },
    },
  });

  const tours = toursRaw.map((t) => {
    const reviewCount = t.reviews.length;
    const avgRating =
      reviewCount > 0
        ? t.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
        : null;
    return {
      ...t,
      description: t.description || "",
      price: Number(t.price),
      reviewCount,
      avgRating,
      vehicleCount: t._count.vehicles,
      slug: t.slug,
    };
  }) as Tour[];

  const currency = await getCurrencyCode();

  return (
    <div className="relative overflow-hidden">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-0 right-1/4 size-80 rounded-full bg-cyan-300/8 blur-3xl" />
      </div>

      {/* ── Page header ── */}
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700
                          animate-in fade-in slide-in-from-left-4 duration-500">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-cyan-600" />
            </span>
            Explore
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1
              className="font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl
                         animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Our{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Tour Packages</span>
                <span
                  className="absolute -bottom-0.5 sm:-bottom-1 left-0 h-1 sm:h-1.25 w-full rounded-full bg-amber-400/60"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <div
              className="flex items-center justify-between gap-3 animate-in fade-in slide-in-from-right-4 duration-500 sm:justify-end"
              style={{ animationDelay: "120ms" }}
            >
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 shadow-sm">
                <span className="font-heading text-base font-extrabold text-slate-950 sm:text-lg">{totalTours}</span>
                <span className="text-[10px] font-medium text-slate-400 sm:text-xs">found</span>
              </div>

              {/* Mobile Filter Trigger */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger
                    render={
                      <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-slate-900/20 active:scale-95 transition-all" />
                    }
                  >
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                    <SheetHeader className="border-b p-6 pb-4">
                      <SheetTitle className="text-left">Adjust Filters</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                      <ToursFilter vehicles={vehicleOptions} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
              <div className="h-1 w-full bg-linear-to-r from-amber-400 via-orange-500 to-cyan-500" />
              <div className="p-6">
                <ToursFilter vehicles={vehicleOptions} />
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <Suspense
              fallback={
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-105 animate-pulse rounded-[1.5rem] bg-slate-100" />
                  ))}
                </div>
              }
            >
              <ToursList tours={tours} currency={currency} />
            </Suspense>
            <ToursPagination currentPage={currentPage} totalPages={totalPages} />
          </main>
        </div>
      </div>
    </div>
  );
}
