"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface GalleryLightboxProps {
  images: string[];
  tourName?: string;
  initialIndex?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideCarousel?: boolean;
}

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function GalleryLightbox({
  images,
  tourName = "Gallery",
  initialIndex = 0,
  open: controlledOpen,
  onOpenChange,
  hideCarousel = false,
}: GalleryLightboxProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (val: boolean) => {
      if (!isControlled) setInternalOpen(val);
      onOpenChange?.(val);
    },
    [isControlled, onOpenChange]
  );

  const [current, setCurrent] = useState(initialIndex);
  const [fading, setFading] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

  useEffect(() => {
    if (isOpen && initialIndex !== undefined) {
      setCurrent(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const go = useCallback(
    (idx: number) => {
      if (idx === current || idx < 0 || idx >= images.length) return;
      setFading(true);
      setTimeout(() => {
        setCurrent(idx);
        setFading(false);
      }, 180);
    },
    [current, images.length]
  );

  const prev = useCallback(
    () => go((current - 1 + images.length) % images.length),
    [go, current, images.length]
  );
  const next = useCallback(
    () => go((current + 1) % images.length),
    [go, current, images.length]
  );
  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, prev, next, close]);

  useEffect(() => {
    if (!isOpen || !thumbsRef.current) return;
    const active = thumbsRef.current.children[current] as HTMLElement;
    if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [current, isOpen]);

  const padded = String(current + 1).padStart(2, "0");
  const total = String(images.length).padStart(2, "0");

  if (images.length === 0) return null;

  return (
    <>
      {!hideCarousel && (
        <div className="mt-5 mb-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Images className="size-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Gallery &middot; {images.length} photos
            </span>
          </div>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[autoplay.current]}
          className="w-full group/carousel"
        >
          <CarouselContent className="-ml-3">
            {images.map((img, idx) => (
              <CarouselItem key={idx} className="pl-3 basis-auto">
                <button
                  onClick={() => { setCurrent(idx); setOpen(true); }}
                  className="group relative block overflow-hidden rounded-2xl focus:outline-none ring-1 ring-slate-200"
                  style={{ width: 140, height: 94 }}
                >
                  <Image
                    src={img}
                    alt={`${tourName} photo ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors duration-300 rounded-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-mono text-sm font-bold text-white drop-shadow-lg">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                </button>
              </CarouselItem>
            ))}

            <CarouselItem className="pl-3 basis-auto">
              <button
                onClick={() => { setCurrent(0); setOpen(true); }}
                className="group relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50 transition-colors duration-300 focus:outline-none"
                style={{ width: 140, height: 94 }}
              >
                <Images className="size-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-500 transition-colors">
                  View all
                </span>
              </button>
            </CarouselItem>
          </CarouselContent>
          
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <CarouselPrevious className="static translate-y-0 h-8 w-8 bg-white/90 backdrop-blur-sm border-slate-200 text-slate-600 hover:text-primary" />
          </div>
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <CarouselNext className="static translate-y-0 h-8 w-8 bg-white/90 backdrop-blur-sm border-slate-200 text-slate-600 hover:text-primary" />
          </div>
        </Carousel>
      </div>
      )}

      {/* Lightbox */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "rgba(4,4,12,0.97)" }}
          onClick={close}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: NOISE_BG, backgroundSize: "128px 128px" }}
          />

          {/* Top bar */}
          <div
            className="relative z-10 flex items-center justify-between px-6 py-4 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                Gallery
              </span>
              <span className="text-sm font-semibold text-white/70 max-w-[200px] truncate">
                {tourName}
              </span>
            </div>

            <div className="flex items-baseline gap-1 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-md">
              <span className="font-mono text-xl font-bold leading-none text-white">{padded}</span>
              <span className="font-mono text-xs text-white/30">/ {total}</span>
            </div>

            <button
              onClick={close}
              className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Main image */}
          <div className="relative flex flex-1 items-center justify-center min-h-0 px-16">
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 z-10 group flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 backdrop-blur-md transition hover:bg-white/15 hover:text-white hover:border-white/25 hover:scale-110"
              >
                <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}

            <div
              className="relative w-full h-full transition-opacity duration-200"
              style={{ opacity: fading ? 0 : 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[current]}
                alt={`${tourName} ${current + 1}`}
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 z-10 group flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 backdrop-blur-md transition hover:bg-white/15 hover:text-white hover:border-white/25 hover:scale-110"
              >
                <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          {/* Bottom thumbnail rail */}
          <div
            className="relative z-10 shrink-0 px-6 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div
              ref={thumbsRef}
              className="flex flex-wrap gap-2 justify-center py-1"
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => go(idx)}
                  className={[
                    "relative shrink-0 overflow-hidden rounded-xl transition-all duration-300 focus:outline-none",
                    idx === current
                      ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#04040c] opacity-100 scale-105"
                      : "opacity-40 hover:opacity-75 hover:scale-105",
                  ].join(" ")}
                  style={{ width: 56, height: 40 }}
                >
                  <Image src={img} alt={`${tourName} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-center">
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/20">
                &larr; &rarr; navigate &middot; esc close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
