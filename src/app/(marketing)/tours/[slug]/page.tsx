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
  Car,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BookingBar } from "./booking-bar";
import { BookingButton } from "./booking-button";
import { db } from "@/lib/db";
import { getSeoSettingsSync, buildMetadata, buildTourSchema } from "@/lib/seo";
import { formatPrice } from "@/lib/currency";
import { getCurrencyCode } from "@/lib/currency-server";
import { cloudinaryImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Script from "next/script";

interface TourVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  thumbnail: string;
  gallery?: string | null;
}

interface Tour {
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: string | null;
  price: number;
  hourlyRate: number;
  durationHours: number;
  duration: string;
  maxPersons: number;
  price2?: number | null;
  hourlyRate2?: number | null;
  baseHours2?: number | null;
  maxPersons2?: number | null;
  thumbnail: string;
  gallery: string | null;
  promoVideoUrl: string | null;
  reviewCount: number;
  avgRating: number | null;
  vehicles: TourVehicle[];
  reviews: Array<{
    id: string;
    userId: string;
    userName: string;
    userImage: string | null;
    rating: number;
    comment: string | null;
    photos: string[];
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
    title: tour.metaTitle || tour.name,
    description: tour.metaDescription || tour.description || "",
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

  const tourInclude = {
    reviews: {
      orderBy: { createdAt: "desc" as const },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            role: true,
          },
        },
      },
    },
    vehicles: {
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            thumbnail: true,
            gallery: true,
          },
        },
      },
    },
  };

  let tourRaw = await db.tourPackage.findFirst({
    where: { slug },
    include: tourInclude,
  });

  if (!tourRaw) {
    tourRaw = await db.tourPackage.findUnique({
      where: { id: slug },
      include: tourInclude,
    });
  }

  if (!tourRaw) {
    notFound();
  }

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
    hourlyRate:
      Number(tourRaw.hourlyRate) > 0
        ? Number(tourRaw.hourlyRate)
        : tourRaw.durationHours > 0
          ? Number(tourRaw.price) / tourRaw.durationHours
          : Number(tourRaw.price),
    durationHours: tourRaw.durationHours,
    duration: tourRaw.duration,
    maxPersons: tourRaw.maxPersons,
    price2: tourRaw.price2 ? Number(tourRaw.price2) : null,
    hourlyRate2: tourRaw.hourlyRate2 ? Number(tourRaw.hourlyRate2) : null,
    baseHours2: tourRaw.baseHours2 ?? null,
    maxPersons2: tourRaw.maxPersons2 ?? null,
    reviewCount,
    avgRating,
    vehicles: tourRaw.vehicles.map((tv) => ({
      id: tv.vehicle.id,
      make: tv.vehicle.make,
      model: tv.vehicle.model,
      year: tv.vehicle.year,
      licensePlate: tv.vehicle.licensePlate,
      thumbnail: tv.vehicle.thumbnail,
      gallery: tv.vehicle.gallery,
    })),
    reviews: tourRaw.reviews.map((r) => {
      const isAdmin = r.user.role === "super_admin" || r.user.role === "admin";
      return {
        id: r.id,
        userId: r.userId,
        userName: isAdmin ? (r.reviewerName || "Happy Traveler") : (r.reviewerName || r.user.name),
        userImage: isAdmin ? r.reviewerImage : (r.reviewerImage || r.user.image),
        rating: r.rating,
        comment: r.comment,
        photos: (r.photos ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        createdAt: r.createdAt,
      };
    }),
  };

  const s = await getSeoSettingsSync();
  const currency = await getCurrencyCode();
  const jsonLdSchema = buildTourSchema(s, tour as any, currency);

  return (
    <div className="relative pb-28 mx-auto max-w-6xl pt-2 sm:pt-4 px-4 sm:px-0">
      {jsonLdSchema && (
        <Script
          id={`tour-schema-${tour.id}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      )}

      {/* ── Cinematic Hero ── */}
      <div>
        <div className="relative h-[50vh] sm:h-[70vh] min-h-100 sm:min-h-130 overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl">
          <Image
            src={cloudinaryImage(tour.thumbnail, 1600)}
            alt={tour.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Top floating bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-8">
            <Link
              href="/tours"
              className="group flex size-10 sm:size-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-slate-950"
            >
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
            </Link>
          </div>

          {/* Hero Bottom info */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                <Clock className="size-3.5 text-amber-400" />
                {tour.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                <Users className="size-3.5 text-amber-400" />
                Up to {tour.maxPersons} persons {tour.maxPersons2 ? `(v2: ${tour.maxPersons2})` : ""}
              </span>
              {tour.avgRating !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-lg">
                  <Star className="size-3.5 fill-slate-950 text-slate-950" />
                  {tour.avgRating.toFixed(1)} ({tour.reviewCount})
                </span>
              )}
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl font-black text-white leading-tight max-w-3xl">
              {tour.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column — Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Highlights */}
          {tour.highlights && (
            <div className="rounded-[2rem] border border-slate-200/80 bg-linear-to-br from-amber-500/5 via-slate-50/50 to-white p-6 sm:p-8 space-y-4">
              <h2 className="font-heading text-xl font-bold text-slate-950">Tour Highlights</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {tour.highlights.split("\n").filter(Boolean).map((hl, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                    <span className="mt-1 flex size-2 shrink-0 rounded-full bg-amber-500" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {tour.description && (
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-slate-950">About This Tour</h2>
              <div
                className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: tour.description }}
              />
            </div>
          )}

          {/* Assigned Vehicles */}
          {tour.vehicles.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-slate-950">Vehicles Available</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {tour.vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                  >
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt="" className="size-16 rounded-xl object-cover border" />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Car className="size-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900">{v.make} {v.model}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{v.licensePlate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Booking Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 sm:p-8 text-white shadow-xl space-y-6">
            <h3 className="font-heading text-xl font-bold">Booking Details</h3>

            <div className="space-y-4 text-sm border-y border-white/10 py-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Up to {tour.maxPersons} people</span>
                <span className="font-bold text-lg">{formatPrice(tour.price, currency)}</span>
              </div>
              {tour.price2 != null && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Up to {tour.maxPersons2} people</span>
                  <span className="font-bold text-lg text-amber-400">{formatPrice(tour.price2, currency)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-white/60">Base Hours</span>
                <span className="font-semibold">{tour.durationHours} hrs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Extra Hour Rate</span>
                <span className="font-semibold">{formatPrice(tour.hourlyRate, currency)}/hr</span>
              </div>
            </div>

            <BookingButton
              tourId={tour.id}
              tour={tour}
              hourlyRate={tour.hourlyRate}
              currency={currency}
              minHours={tour.durationHours}
              maxPersons={tour.maxPersons2 && tour.maxPersons2 > tour.maxPersons ? tour.maxPersons2 : tour.maxPersons}
              vehicles={tour.vehicles}
              className="w-full h-12 text-base font-bold"
            />
          </div>
        </aside>
      </div>

      <BookingBar
        tourId={tour.id}
        name={tour.name}
        price={tour.price}
        hourlyRate={tour.hourlyRate}
        duration={tour.duration}
        durationHours={tour.durationHours}
        vehicles={tour.vehicles}
        maxPersons={tour.maxPersons}
        rating={tour.avgRating ? tour.avgRating.toFixed(1) : null}
        currency={currency}
        tour={tour}
      />
    </div>
  );
}
