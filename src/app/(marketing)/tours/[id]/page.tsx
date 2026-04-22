import type { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Clock, Users, Star, ArrowLeft, Quote, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BookingBar } from "./booking-bar";
import { BookingButton } from "./booking-button";
import { getSeoSettingsSync, buildMetadata, buildTourSchema } from "@/lib/seo";

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
}

interface Review {
  id: string;
  userName: string;
  userImage: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

interface TourDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TourDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const tourData = await db.tourPackage.findUnique({
    where: { id },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  if (!tourData) return {};

  const reviewCount = tourData.reviews.length;
  const avgRating =
    reviewCount > 0
      ? tourData.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : null;

  const tour = {
    ...tourData,
    reviewCount,
    avgRating,
  } as Tour;

  const s = getSeoSettingsSync();
  return buildMetadata(s, {
    title: tour.name,
    description: tour.description
      ? tour.description.slice(0, 155) + (tour.description.length > 155 ? "…" : "")
      : `Book ${tour.name} — ${tour.duration}, up to ${tour.maxPersons} persons from $${tour.price}.`,
    image: tour.thumbnail || undefined,
    canonical: `/tours/${id}`,
    type: "article",
  });
}

const reviewAccents = [
  { bar: "from-amber-400 to-orange-500", avatar: "bg-amber-100 text-amber-700" },
  { bar: "from-cyan-400 to-sky-500",     avatar: "bg-cyan-100 text-cyan-700" },
  { bar: "from-emerald-400 to-teal-500", avatar: "bg-emerald-100 text-emerald-700" },
  { bar: "from-violet-400 to-purple-500", avatar: "bg-violet-100 text-violet-700" },
];

export default async function TourDetailsPage({ params }: TourDetailsPageProps) {
  const { id } = await params;

  const tourData = await db.tourPackage.findUnique({
    where: { id },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  if (!tourData) notFound();

  const reviewCount = tourData.reviews.length;
  const avgRating =
    reviewCount > 0
      ? tourData.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : null;

  const tour = {
    ...tourData,
    reviewCount,
    avgRating,
  } as Tour;

  const reviewsData = await db.review.findMany({
    where: { tourPackageId: id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const reviews = reviewsData.map((r) => ({
    ...r,
    userName: r.user.name,
    userImage: r.user.image,
    createdAt: r.createdAt.toISOString(),
  })) as Review[];

  const galleryUrls = tour.gallery ? tour.gallery.split(",").map((u) => u.trim()).filter(Boolean) : [];
  const rating = tour.avgRating ? tour.avgRating.toFixed(1) : null;

  const seoSettings = getSeoSettingsSync();
  const tourSchema = buildTourSchema(seoSettings, tour);

  return (
    <>
      {tourSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }}
        />
      )}
    <div className="relative overflow-hidden pb-28">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-20 right-1/4 size-80 rounded-full bg-cyan-300/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* ── Back link ── */}
        <Link
          href="/tours"
          className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to all tours
        </Link>

        {/* ── Main grid ── */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">

          {/* ── LEFT: images ── */}
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Main thumbnail */}
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-100 shadow-2xl shadow-slate-200/60 aspect-video">
              {tour.thumbnail ? (
                <Image
                  src={tour.thumbnail}
                  alt={tour.name}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <MapPin className="size-12 text-slate-300" />
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/20 to-transparent" />

              {/* Floating price badge */}
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-sm">
                <p className="font-heading text-2xl font-extrabold text-slate-950">
                  ${tour.price.toLocaleString()}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">per person</p>
              </div>

              {/* Rating badge */}
              {rating && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-heading text-base font-extrabold text-slate-950">{rating}</span>
                  <span className="text-[10px] text-slate-400">({tour.reviewCount})</span>
                </div>
              )}
            </div>

            {/* Gallery */}
            {galleryUrls.length > 0 && (
              <div className={`grid gap-4 ${galleryUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {galleryUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-lg shadow-slate-200/40"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {tour.description && (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
                <div className="h-1 w-full bg-linear-to-r from-cyan-400 to-sky-500" />
                <div className="p-6">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">About this tour</p>
                  <p className="text-sm leading-8 text-slate-600">{tour.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: details ── */}
          <div
            className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 lg:sticky lg:top-24"
            style={{ animationDelay: "100ms" }}
          >
            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-1.5 text-xs font-bold text-cyan-700">
                <Clock className="size-3" />
                {tour.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600">
                <Users className="size-3" />
                Up to {tour.maxPersons} persons
              </span>
              {rating ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {rating} · {tour.reviewCount} review{tour.reviewCount !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                  New
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              {tour.name}
            </h1>

            {/* Booking card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
              <div className="h-1 w-full bg-linear-to-r from-amber-400 to-orange-500" />
              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Total package price
                </p>
                <p className="mt-1 font-heading text-5xl font-extrabold text-slate-950">
                  ${tour.price.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-400">per person · all inclusive</p>

                <BookingButton tourId={tour.id} />

                <div className="mt-4 flex items-center gap-2">
                  <div className="h-0.75 w-8 rounded-full bg-linear-to-r from-amber-400 to-orange-500" />
                  <div className="h-0.75 w-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 opacity-40" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        {reviews.length > 0 && (
          <div className="mt-24 space-y-10">
            {/* Section header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-cyan-600" />
                  </span>
                  Reviews
                </div>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                  Customer{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">Experiences</span>
                    <span className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
                  </span>
                </h2>
              </div>

              {/* Aggregate rating pill */}
              {rating && (
                <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="h-6 w-px bg-slate-100" />
                  <div>
                    <p className="font-heading text-lg font-bold leading-none text-slate-950">{rating}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Avg. Rating</p>
                  </div>
                </div>
              )}
            </div>

            {/* Review cards */}
            <div className="grid gap-5 md:grid-cols-2">
              {reviews.map((review, i) => {
                const accent = reviewAccents[i % reviewAccents.length];
                const initials = review.userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <div
                    key={review.id}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className="group animate-in fade-in slide-in-from-bottom-3 duration-500
                               relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white
                               shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className={`h-1 w-full bg-linear-to-r ${accent.bar}`} />
                    <div className="space-y-4 p-6">
                      <Quote className="size-6 text-slate-200" />

                      {/* Stars */}
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`size-3.5 ${idx < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
                          />
                        ))}
                      </div>

                      <p className="text-sm leading-7 text-slate-600 italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>

                      <div className="h-px w-full bg-slate-100" />

                      {/* Author */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${accent.avatar}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-950 leading-none">{review.userName}</p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-0.75 w-6 rounded-full bg-linear-to-r ${accent.bar}`} />
                          <div className={`h-0.75 w-3 rounded-full bg-linear-to-r ${accent.bar} opacity-40`} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
      <BookingBar
        tourId={tour.id}
        name={tour.name}
        price={tour.price}
        duration={tour.duration}
        maxPersons={tour.maxPersons}
        rating={rating}
      />
    </>
  );
}
