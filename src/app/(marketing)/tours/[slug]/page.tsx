import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Clock,
  Users,
  Star,
  ArrowLeft,
  Quote,
  MapPin,
  Camera,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BookingBar } from "./booking-bar";
import { BookingButton } from "./booking-button";
import Script from "next/script";

import { db } from "@/lib/db";
import { getSeoSettingsSync, buildMetadata, buildTourSchema } from "@/lib/seo";
import { formatPrice } from "@/lib/currency";
import { getCurrencyCode } from "@/lib/currency-server";

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  maxPersons: number;
  thumbnail: string;
  gallery: string | null;
  highlights: string | null;
  reviewCount: number;
  avgRating: number | null;
  reviews: Array<{
    id: string;
    userName: string;
    userImage: string | null;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }>;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let tour = await db.tourPackage.findFirst({
    where: { slug },
  });

  if (!tour) {
    tour = await db.tourPackage.findUnique({
      where: { id: slug },
    });
  }

  if (!tour) return {};

  const s = await getSeoSettingsSync();
  return buildMetadata(s, {
    title: tour.name,
    description: tour.description || "",
    canonical: `/tours/${tour.slug || tour.id}`,
    image: tour.thumbnail,
  });
}

export default async function TourDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try fetching by slug first, then fallback to id
  let tourRaw = await db.tourPackage.findFirst({
    where: { slug },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!tourRaw) {
    // Fallback for old ID links
    tourRaw = await db.tourPackage.findUnique({
      where: { id: slug },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }

  if (!tourRaw) {
    notFound();
  }

  // Calculate stats and convert Decimals
  const reviewCount = tourRaw.reviews.length;
  const avgRating =
    reviewCount > 0
      ? tourRaw.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : null;

  const tour: Tour = {
    ...tourRaw,
    description: tourRaw.description || "",
    highlights: tourRaw.highlights ?? null,
    price: Number(tourRaw.price),
    reviewCount,
    avgRating,
    reviews: tourRaw.reviews.map((r) => ({
      id: r.id,
      userName: r.user.name,
      userImage: r.user.image,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })),
  };

  const s = await getSeoSettingsSync();
  const currency = await getCurrencyCode();
  const jsonLdSchema = buildTourSchema(s, tour as any, currency);

  return (
    <div className="relative  pb-28 mx-auto max-w-6xl pt-4">
      {jsonLdSchema && (
        <Script
          id={`tour-schema-${tour.id}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      )}

      {/* ── Cinematic Hero — full width ── */}
      <div>
        <div className="relative h-[70vh] min-h-130 overflow-hidden rounded-[2.5rem] shadow-2xl">
          {/* Background image */}
          <Image
            src={tour.thumbnail}
            alt={tour.name}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/50 to-slate-900/10" />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/40 to-transparent" />

          {/* Back link */}
          <div className="absolute left-5 top-6">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ArrowLeft className="size-4" />
              All Tours
            </Link>
          </div>

          {/* Gallery count badge */}
          {tour.gallery && (
            <div className="absolute right-5 top-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                <Camera className="size-3.5" />
                {tour.gallery
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean).length + 1}{" "}
                Photos
              </span>
            </div>
          )}

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4 max-w-3xl">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {tour.avgRating ? tour.avgRating.toFixed(1) : "New"} ·{" "}
                    {tour.reviewCount}{" "}
                    {tour.reviewCount === 1 ? "review" : "reviews"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
                    <Clock className="size-3" />
                    {tour.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
                    <Users className="size-3" />
                    Up to {tour.maxPersons}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
                  {tour.name}
                </h1>
              </div>

              {/* Price + CTA */}
              {/* <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl">
                <div className="flex flex-col items-center justify-center rounded-xl bg-white/15 px-5 py-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                    From
                  </span>
                  <span className="text-2xl font-black leading-none">
                    {formatPrice(tour.price, currency)}
                  </span>
                  <span className="text-[10px] text-white/50">per person</span>
                </div>
                <BookingButton tourId={tour.id} className="shrink-0" />
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery + content — right padding reserves space for sidebar ── */}
      <div className="lg:pr-[22rem]">
        {/* ── Gallery strip ── */}
        {tour.gallery &&
          tour.gallery
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean).length > 0 && (
            <div>
              <div className="flex gap-2 overflow-x-auto py-4 scrollbar-none">
                {tour.gallery
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl ring-2 ring-transparent transition hover:ring-indigo-400"
                    >
                      <Image
                        src={img}
                        alt={`${tour.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

        <div className="pt-8">
          {/* ── Main content ── */}
          <div className="space-y-16">
            {/* Description */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-primary" />
                <h2 className="font-heading text-3xl font-bold text-slate-950">
                  Experience Description
                </h2>
              </div>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                {tour.description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>

            {/* Highlights */}
            {tour.highlights && tour.highlights.split("\n").filter(Boolean).length > 0 && (
              <section className="rounded-[2.5rem] bg-slate-50 p-8 md:p-12 border border-slate-100">
                <h3 className="mb-8 font-heading text-2xl font-bold text-slate-950">
                  Tour Highlights
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {tour.highlights.split("\n").filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <svg className="size-3 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      </div>
                      <span className="text-lg font-medium text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 rounded-full bg-amber-400" />
                  <h2 className="font-heading text-3xl font-bold text-slate-950">
                    Traveler Reviews
                  </h2>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900">
                      {tour.avgRating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-slate-400">/ 5.0</span>
                  </div>
                </div>
              </div>

              {tour.reviews.length > 0 ? (
                <div className="grid gap-6">
                  {tour.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="group relative rounded-[2rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 ring-1 ring-slate-100"
                    >
                      <Quote className="absolute right-8 top-8 size-12 text-slate-50 transition-colors group-hover:text-indigo-50" />
                      <div className="relative flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                          <div className="relative size-14 overflow-hidden rounded-2xl ring-2 ring-white shadow-md">
                            {rev.userImage ? (
                              <Image
                                src={rev.userImage}
                                alt={rev.userName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                <Users className="size-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-950">
                              {rev.userName}
                            </p>
                            <div className="mt-0.5 flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "size-3",
                                    i < rev.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="ml-auto text-xs font-semibold uppercase tracking-widest text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" },
                            )}
                          </span>
                        </div>
                        <p className="text-lg leading-relaxed text-slate-600">
                          {rev.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                    <Star className="size-8 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">
                    No reviews yet
                  </h3>
                  <p className="text-slate-500">
                    Be the first traveler to share your experience!
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Sidebar — absolute on desktop: overlays hero at 40% from top */}
      <aside className="mt-8 space-y-8 lg:absolute lg:right-5 lg:top-[45vh] lg:mt-0 lg:w-80 lg:z-10">
        <div
          className="relative overflow-hidden rounded-[2.5rem] bg-[#05020f] p-8 text-white shadow-md shadow-black/30"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #0a0520 0%, #0d0a2e 40%, #130826 70%, #0a0318 100%)",
          }}
        >
          {/* Gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-violet-700/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 size-72 rounded-full bg-indigo-800/15 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/8 blur-2xl" />
            <div className="absolute right-1/4 bottom-0 size-40 rounded-full bg-pink-700/10 blur-2xl" />
          </div>
          {/* Dot-grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Top shimmer line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

          <div className="relative">
            <h3 className="mb-6 font-heading text-2xl font-bold">
              Booking Details
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-white/50">Price per person</span>
                <span className="text-2xl font-black">
                  {formatPrice(tour.price, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-white/50">Total Duration</span>
                <span className="font-bold">{tour.duration}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-white/50">Group Size</span>
                <span className="font-bold">Max {tour.maxPersons}</span>
              </div>
              <div className="space-y-4 pt-4">
                <BookingButton
                  tourId={tour.id}
                  className="w-full h-14 text-lg"
                />
                <p className="text-center text-xs font-medium text-white/30">
                  Secure payment via Stripe &middot; Instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-indigo-50 p-8 ring-1 ring-indigo-100">
          <h4 className="mb-4 font-bold text-indigo-900">Need Help?</h4>
          <p className="mb-6 text-sm leading-relaxed text-indigo-700/80">
            Have questions about this tour or need a custom itinerary? Our
            experts are available 24/7.
          </p>
          <div className="flex flex-col gap-3">
            <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white font-bold text-indigo-900 shadow-sm transition-transform active:scale-95">
              <MapPin className="size-4" />
              View Route Map
            </button>
            <Link
              href="/#contact"
              className="flex h-12 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-200 transition-transform active:scale-95"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </aside>
      <BookingBar
        tourId={tour.id}
        name={tour.name}
        price={tour.price}
        duration={tour.duration}
        maxPersons={tour.maxPersons}
        rating={tour.avgRating ? tour.avgRating.toFixed(1) : null}
        currency={currency}
      />
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
