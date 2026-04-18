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

  if (sort === "price-asc") {
    query += ` ORDER BY tp.price ASC`;
  } else if (sort === "price-desc") {
    query += ` ORDER BY tp.price DESC`;
  } else if (sort === "name-asc") {
    query += ` ORDER BY tp.name ASC`;
  } else {
    query += ` ORDER BY tp.createdAt DESC`;
  }

  const tours = db.prepare(query).all(...dbParams) as Tour[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
          Explore
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-950">
            Our Tour Packages
          </h1>
          <p className="text-sm text-slate-500">
            Showing {tours.length} unique experiences
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10 md:flex-row">
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ToursFilter />
          </div>
        </aside>
        <main className="flex-1">
          <Suspense fallback={<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>}>
            <ToursList tours={tours} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
