"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

export function ToursPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false, scroll: true }),
  );

  if (totalPages <= 1) return null;

  const go = (p: number) => setPage(p <= 1 ? null : p);
  const items = pageItems(currentPage, totalPages);

  const arrow =
    "inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage <= 1}
        className={arrow}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {items.map((it, i) =>
        it === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-slate-400">
            …
          </span>
        ) : (
          <button
            key={it}
            onClick={() => go(it)}
            aria-current={it === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-xl border text-sm font-semibold shadow-sm transition",
              it === currentPage
                ? "border-transparent bg-linear-to-r from-amber-400 to-orange-500 text-white shadow-amber-400/30"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900",
            )}
          >
            {it}
          </button>
        ),
      )}

      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={arrow}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
