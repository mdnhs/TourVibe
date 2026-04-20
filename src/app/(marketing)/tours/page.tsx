import { Suspense } from "react";
import { db } from "@/lib/db";
import { toursSearchParamsCache } from "./search-params";
import { ToursList } from "./tours-list";
import { ToursFilter } from "./tours-filter";
import { SearchParams } from "nuqs/server";

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  maxPersons: number;
  thumbnail: string;
  reviewCount: number;
  avgRating: number | null;
}

interface ToursPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const { q, minPrice, maxPrice, sort } = await toursSearchParamsCache.parse(searchParams);

  let query = `
    SELECT tp.*,
           (SELECT COUNT(*) FROM review WHERE tourPackageId = tp.id) as reviewCount,
           (SELECT AVG(rating) FROM review WHERE tourPackageId = tp.id) as avgRating
    FROM tour_package tp
    WHERE 1=1
  `;
  const dbParams: (string | number)[] = [];

  if (q) {
    query += ` AND (tp.name LIKE ? OR tp.description LIKE ?)`;
    dbParams.push(`%${q}%`, `%${q}%`);
  }
  if (minPrice !== null) {
    query += ` AND tp.price >= ?`;
    dbParams.push(minPrice);
  }
  if (maxPrice !== null) {
    query += ` AND tp.price <= ?`;
    dbParams.push(maxPrice);
  }
  if (sort === "price-asc")       query += ` ORDER BY tp.price ASC`;
  else if (sort === "price-desc") query += ` ORDER BY tp.price DESC`;
  else if (sort === "name-asc")   query += ` ORDER BY tp.name ASC`;
  else                            query += ` ORDER BY tp.createdAt DESC`;

  const tours = db.prepare(query).all(...dbParams) as Tour[];

  return (
    <div className="relative overflow-hidden">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-0 right-1/4 size-80 rounded-full bg-cyan-300/8 blur-3xl" />
      </div>

      {/* ── Page header ── */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700
                          animate-in fade-in slide-in-from-left-4 duration-500">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-cyan-600" />
            </span>
            Explore
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1
              className="font-heading text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl
                         animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Our{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Tour Packages</span>
                <span
                  className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <div
              className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500"
              style={{ animationDelay: "120ms" }}
            >
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <span className="font-heading text-lg font-extrabold text-slate-950">{tours.length}</span>
                <span className="text-xs font-medium text-slate-400">experience{tours.length !== 1 ? "s" : ""} found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="w-full shrink-0 md:w-64">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
              {/* Sidebar top bar */}
              <div className="h-1 w-full bg-linear-to-r from-amber-400 via-orange-500 to-cyan-500" />
              <div className="p-6">
                <ToursFilter />
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <Suspense
              fallback={
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[420px] animate-pulse rounded-[1.5rem] bg-slate-100" />
                  ))}
                </div>
              }
            >
              <ToursList tours={tours} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
