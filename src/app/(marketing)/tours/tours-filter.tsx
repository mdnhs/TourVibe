"use client";

import { useQueryStates } from "nuqs";
import { toursSearchParams } from "./search-params";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  X,
  Tag,
  ArrowDownUp,
  Car,
} from "lucide-react";

type VehicleOption = { id: string; label: string };

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
      <Icon className="size-3" />
      {children}
    </label>
  );
}

export function ToursFilter({ vehicles = [] }: { vehicles?: VehicleOption[] }) {
  const [params, setParams] = useQueryStates(toursSearchParams, {
    shallow: false,
  });

  const clearFilters = () =>
    setParams({ q: "", minPrice: null, maxPrice: null, sort: "newest", vehicle: "", page: null });

  const vehicleLabel = vehicles.find((v) => v.id === params.vehicle)?.label;

  const hasFilters =
    params.q ||
    params.minPrice !== null ||
    params.maxPrice !== null ||
    params.sort !== "newest" ||
    !!params.vehicle;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
            <SlidersHorizontal className="size-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Filters</h2>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
          >
            <X className="size-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="h-px w-full bg-slate-100" />

      {/* Search */}
      <div className="space-y-2">
        <FieldLabel icon={Search}>Search</FieldLabel>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Package name..."
            className="rounded-xl border-slate-200 pl-9 text-sm placeholder:text-slate-400 focus-visible:border-amber-400 focus-visible:ring-amber-400/20"
            value={params.q ?? ""}
            onChange={(e) => setParams({ q: e.target.value || null, page: null })}
          />
        </div>
      </div>

      {/* Vehicle */}
      <div className="space-y-2">
        <FieldLabel icon={Car}>Vehicle</FieldLabel>
        <Select
          value={params.vehicle || "all"}
          onValueChange={(val) => setParams({ vehicle: val === "all" ? "" : val, page: null })}
        >
          <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm focus:border-amber-400 focus:ring-amber-400/20">
            <SelectValue placeholder="Any vehicle">
              {params.vehicle ? vehicleLabel ?? "Selected vehicle" : "Any vehicle"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Any vehicle</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <FieldLabel icon={Tag}>Price Range</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min $"
            className="rounded-xl border-slate-200 text-sm placeholder:text-slate-400 focus-visible:border-amber-400 focus-visible:ring-amber-400/20"
            value={params.minPrice ?? ""}
            onChange={(e) =>
              setParams({ minPrice: e.target.value ? parseInt(e.target.value) : null, page: null })
            }
          />
          <span className="shrink-0 text-xs font-medium text-slate-300">—</span>
          <Input
            type="number"
            placeholder="Max $"
            className="rounded-xl border-slate-200 text-sm placeholder:text-slate-400 focus-visible:border-amber-400 focus-visible:ring-amber-400/20"
            value={params.maxPrice ?? ""}
            onChange={(e) =>
              setParams({ maxPrice: e.target.value ? parseInt(e.target.value) : null, page: null })
            }
          />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <FieldLabel icon={ArrowDownUp}>Sort By</FieldLabel>
        <Select
          value={params.sort ?? "newest"}
          onValueChange={(val) => setParams({ sort: val, page: null })}
        >
          <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm focus:border-amber-400 focus:ring-amber-400/20">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filter pills */}
      {hasFilters && (
        <div className="space-y-2">
          <div className="h-px w-full bg-slate-100" />
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Active filters
          </p>
          <div className="flex flex-wrap gap-1.5">
            {params.vehicle && (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                <Car className="size-2.5" />
                {vehicleLabel ?? "Selected vehicle"}
                <button onClick={() => setParams({ vehicle: "" })} className="hover:text-indigo-900">
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {params.q && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                &ldquo;{params.q}&rdquo;
                <button onClick={() => setParams({ q: null })} className="hover:text-amber-900">
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {params.minPrice !== null && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                Min ${params.minPrice}
                <button onClick={() => setParams({ minPrice: null })} className="hover:text-cyan-900">
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {params.maxPrice !== null && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                Max ${params.maxPrice}
                <button onClick={() => setParams({ maxPrice: null })} className="hover:text-cyan-900">
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {params.sort && params.sort !== "newest" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                {params.sort === "price-asc" ? "Price ↑" : params.sort === "price-desc" ? "Price ↓" : "A–Z"}
                <button onClick={() => setParams({ sort: "newest" })} className="hover:text-emerald-900">
                  <X className="size-2.5" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
