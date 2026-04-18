"use client";

import { useQueryStates } from "nuqs";
import { toursSearchParams } from "./search-params";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function ToursFilter() {
  const [params, setParams] = useQueryStates(toursSearchParams, {
    shallow: false, // Set to false to trigger server-side re-render
  });

  const clearFilters = () => {
    setParams({
      q: "",
      minPrice: null,
      maxPrice: null,
      sort: "newest",
    });
  };

  const hasFilters = params.q || params.minPrice !== null || params.maxPrice !== null || params.sort !== "newest";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-0 text-cyan-700 hover:text-cyan-800"
          >
            <X className="mr-1 size-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
            <Input
              id="search"
              placeholder="Package name..."
              className="pl-9"
              value={params.q ?? ""}
              onChange={(e) => setParams({ q: e.target.value || null })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={params.minPrice ?? ""}
              onChange={(e) =>
                setParams({
                  minPrice: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
            <span className="text-slate-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={params.maxPrice ?? ""}
              onChange={(e) =>
                setParams({
                  maxPrice: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={params.sort ?? "newest"}
            onValueChange={(val) => setParams({ sort: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
