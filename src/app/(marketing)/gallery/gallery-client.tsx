"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Sparkles, Video, Image as PhotoIcon, Play, X, Star, Maximize2, Layers, MapPin, Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryLightbox } from "../tours/[slug]/gallery-lightbox";

interface GalleryItem {
  id: string;
  title: string | null;
  caption: string | null;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  category: string;
  location?: string | null;
  featured: boolean;
  createdAt: Date;
}

export function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [filterType, setFilterType] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<GalleryItem | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  // Extract unique locations
  const locations = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.location && i.location.trim()) set.add(i.location.trim());
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType !== "ALL" && item.type !== filterType) return false;
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
      if (selectedLocation !== "ALL" && item.location !== selectedLocation) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const captionMatch = item.caption?.toLowerCase().includes(q);
        const categoryMatch = item.category?.toLowerCase().includes(q);
        const locationMatch = item.location?.toLowerCase().includes(q);
        if (!titleMatch && !captionMatch && !categoryMatch && !locationMatch) return false;
      }

      return true;
    });
  }, [items, filterType, selectedCategory, selectedLocation, searchQuery]);

  const photoItems = useMemo(() => {
    return filteredItems.filter((i) => i.type === "IMAGE");
  }, [filteredItems]);

  const photoUrls = useMemo(() => {
    return photoItems.map((i) => i.url);
  }, [photoItems]);

  const handleItemClick = (item: GalleryItem) => {
    if (item.type === "VIDEO") {
      setActiveVideo(item);
    } else {
      const idx = photoItems.findIndex((p) => p.id === item.id);
      setLightboxIndex(idx >= 0 ? idx : 0);
      setLightboxOpen(true);
    }
  };

  const hasActiveFilters =
    filterType !== "ALL" || selectedCategory !== "ALL" || selectedLocation !== "ALL" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setFilterType("ALL");
    setSelectedCategory("ALL");
    setSelectedLocation("ALL");
    setSearchQuery("");
  };

  return (
    <div className="space-y-8">
      {/* ── Search & Filter Control Panel ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, or tag..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Type Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  filterType === "ALL"
                    ? "bg-slate-950 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-950"
                )}
              >
                <Layers className="size-3.5" />
                All ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("IMAGE")}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  filterType === "IMAGE"
                    ? "bg-slate-950 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-950"
                )}
              >
                <PhotoIcon className="size-3.5" />
                Photos ({items.filter((i) => i.type === "IMAGE").length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("VIDEO")}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  filterType === "VIDEO"
                    ? "bg-slate-950 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-950"
                )}
              >
                <Video className="size-3.5" />
                Videos ({items.filter((i) => i.type === "VIDEO").length})
              </button>
            </div>

            {/* Location Selector */}
            {locations.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">📍 All Locations ({items.filter((i) => i.location).length})</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Topics:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={cn(
                "rounded-full px-3.5 py-1 text-xs font-semibold transition-all border cursor-pointer",
                selectedCategory === "ALL"
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-900 font-bold shadow-2xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              All Topics
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-semibold transition-all border cursor-pointer",
                    selectedCategory === cat
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-900 font-bold shadow-2xs"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  )}
                >
                  {cat} <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Gallery Masonry Grid ── */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center text-slate-600 shadow-xs">
          <Sparkles className="mx-auto size-10 text-amber-500 mb-3" />
          <p className="font-heading text-lg font-bold text-slate-900">No media match your search or filters</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting a different topic, or resetting location filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredItems.map((item) => {
            const isVideo = item.type === "VIDEO";
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="break-inside-avoid mb-6 inline-block w-full group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-2xl cursor-pointer"
              >
                {/* Media Container */}
                <div className="relative w-full overflow-hidden bg-slate-100">
                  {isVideo ? (
                    item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title || "Gallery item"}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-auto object-cover max-h-96"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    )
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || "Gallery item"}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-20 transition-opacity duration-300 group-hover:opacity-60" />

                  {/* Top Floating Badges (Revealed on Hover or Video indicator) */}
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10">
                    {isVideo && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1 text-[11px] font-extrabold text-slate-950 shadow-md backdrop-blur-md">
                        <Video className="size-3 text-slate-950" />
                        Video
                      </span>
                    )}
                    {item.category && item.category !== "General" && (
                      <span className="rounded-xl bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/10 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {item.featured && (
                    <div className="absolute top-3.5 right-3.5 flex size-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md border border-amber-300 z-10">
                      <Star className="size-3.5 fill-slate-950" />
                    </div>
                  )}

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex size-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-2xl transition-transform duration-300 group-hover:scale-110">
                      {isVideo ? <Play className="size-5 fill-slate-950 ml-0.5" /> : <Maximize2 className="size-5" />}
                    </div>
                  </div>

                  {/* Location badge on bottom left of image (Revealed on Hover) */}
                  {item.location && (
                    <div className="absolute bottom-3 left-3.5 z-10 flex items-center gap-1 rounded-xl bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md border border-white/10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <MapPin className="size-3 text-amber-400" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                {/* Footer Info (Only shown if title, location, or detailed caption exist) */}
                {(item.title || item.caption || (item.location && item.location.length > 0)) && (
                  <div className="p-3.5 space-y-1 bg-white">
                    {item.location && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                        <MapPin className="size-3 text-amber-500" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    {item.title && (
                      <h3 className="font-heading text-sm font-bold text-slate-900 transition-colors group-hover:text-amber-600 line-clamp-1">
                        {item.title}
                      </h3>
                    )}
                    {item.caption && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox component for photos */}
      <GalleryLightbox
        images={photoUrls}
        tourName={selectedCategory !== "ALL" ? `${selectedCategory} Media` : "TourVibe Media Gallery"}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        hideCarousel={true}
      />

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  {activeVideo.category}
                </span>
                <h3 className="font-heading text-lg font-bold text-white">
                  {activeVideo.title || "Video Preview"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Video Viewer Area */}
            <div className="relative flex max-h-[70vh] items-center justify-center bg-black p-2">
              <video
                src={activeVideo.url}
                controls
                autoPlay
                className="max-h-[65vh] w-full rounded-xl object-contain"
              />
            </div>

            {/* Modal Caption Footer */}
            {activeVideo.caption && (
              <div className="border-t border-white/10 bg-slate-900/90 px-6 py-4">
                <p className="text-xs text-slate-300 leading-relaxed">{activeVideo.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
