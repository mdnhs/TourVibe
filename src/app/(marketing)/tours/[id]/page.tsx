"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { Clock, Users, Star, ArrowLeft, Quote, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BookingBar } from "./booking-bar";
import { BookingButton } from "./booking-button";
import Script from "next/script";

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  maxPersons: number;
  thumbnail: string;
  gallery: string | null;
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

export default function TourDetailsPage({
  tour,
  jsonLdSchema,
}: {
  tour: Tour;
  jsonLdSchema: any;
}) {
  return (
    <div className="relative overflow-hidden pb-28">
      {jsonLdSchema && (
        <Script
          id={`tour-schema-${tour.id}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      )}

      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-20 right-1/4 size-80 rounded-full bg-cyan-300/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft className="size-4" />
              Explore All Tours
            </Link>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {tour.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Star className="size-3.5 fill-current" />
                </div>
                <span>
                  {tour.avgRating ? tour.avgRating.toFixed(1) : "New"} (
                  {tour.reviewCount} Reviews)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Clock className="size-3.5" />
                </div>
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Users className="size-3.5" />
                </div>
                <span>Up to {tour.maxPersons} People</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl bg-white p-2 pr-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200">
            <div className="flex h-14 w-28 flex-col items-center justify-center rounded-2xl bg-slate-950 text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                From
              </span>
              <span className="text-xl font-black">${tour.price}</span>
            </div>
            <BookingButton tourId={tour.id} />
          </div>
        </div>

        {/* ── Gallery ── */}
        <div className="group relative mb-16 overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-2xl">
          <div className="grid h-[500px] grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-2 p-2">
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-[2rem]">
              <Image
                src={tour.thumbnail}
                alt={tour.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </div>
            {tour.gallery?.split(",").slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className="relative hidden overflow-hidden rounded-[1.5rem] lg:block"
              >
                <Image
                  src={img.trim()}
                  alt={`${tour.name} ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-16">
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
            <section className="rounded-[2.5rem] bg-slate-50 p-8 md:p-12 border border-slate-100">
              <h3 className="mb-8 font-heading text-2xl font-bold text-slate-950">
                Tour Highlights
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  "Luxury air-conditioned vehicles",
                  "Expert multi-lingual guides",
                  "All entry fees & permits included",
                  "Complimentary refreshments",
                  "Flexible pickup & drop-off",
                  "Photo opportunities at every stop",
                ].map((item, i) => (
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

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 h-fit space-y-8">
            <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl">
              <h3 className="mb-6 font-heading text-2xl font-bold">
                Booking Details
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400">Price per person</span>
                  <span className="text-2xl font-black">${tour.price}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400">Total Duration</span>
                  <span className="font-bold">{tour.duration}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-400">Group Size</span>
                  <span className="font-bold">Max {tour.maxPersons}</span>
                </div>
                <div className="space-y-4 pt-4">
                  <BookingButton tourId={tour.id} className="w-full h-14 text-lg" />
                  <p className="text-center text-xs font-medium text-slate-500">
                    Secure payment via Stripe &middot; Instant confirmation
                  </p>
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
        </div>
      </div>
      <BookingBar tour={tour} />
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
