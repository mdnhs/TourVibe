import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";

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

export default async function TourDetailsPage({ params }: TourDetailsPageProps) {
  const { id } = await params;

  const tour = db.prepare(`
    SELECT tp.*, 
           (SELECT COUNT(*) FROM review WHERE tourPackageId = tp.id) as reviewCount,
           (SELECT AVG(rating) FROM review WHERE tourPackageId = tp.id) as avgRating
    FROM tour_package tp
    WHERE tp.id = ?
  `).get(id) as Tour;

  if (!tour) {
    notFound();
  }

  const reviews = db.prepare(`
    SELECT r.*, u.name as userName, u.image as userImage
    FROM review r
    JOIN user u ON r.userId = u.id
    WHERE r.tourPackageId = ?
    ORDER BY r.createdAt DESC
  `).all(id) as Review[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10">
        <Link href="/tours" className="inline-flex items-center text-sm font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-950 transition">
          <ChevronLeft className="mr-1.5 size-4" />
          Back to all tours
        </Link>
      </div>

      <div className="grid gap-16 lg:grid-cols-2">
        <div className="space-y-10">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-video relative shadow-2xl shadow-slate-200/50">
            <img
              src={tour.thumbnail || "/placeholder.svg"}
              alt={tour.name}
              className="h-full w-full object-cover"
            />
          </div>

          {tour.gallery && (
            <div className="grid grid-cols-2 gap-6">
              {tour.gallery.split(",").map((url: string, idx: number) => (
                <div key={idx} className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-lg shadow-slate-200/30">
                  <img src={url.trim()} alt="" className="h-full w-full object-cover transition-transform hover:scale-110 duration-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <Badge className="rounded-full bg-cyan-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800 hover:bg-cyan-100">
                {tour.duration}
              </Badge>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="size-4 fill-current" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  {tour.avgRating ? tour.avgRating.toFixed(1) : "New"}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  ({tour.reviewCount} reviews)
                </span>
              </div>
            </div>
            <h1 className="font-heading text-5xl font-semibold tracking-tight text-slate-950">
              {tour.name}
            </h1>
          </div>

          <p className="text-lg leading-relaxed text-slate-600">
            {tour.description}
          </p>

          <div className="grid grid-cols-2 gap-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700 flex items-center gap-2">
                <Users className="size-4" />
                Capacity
              </p>
              <p className="text-xl font-semibold text-slate-950">Up to {tour.maxPersons} Persons</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700 flex items-center gap-2">
                <Clock className="size-4" />
                Duration
              </p>
              <p className="text-xl font-semibold text-slate-950">{tour.duration}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total package price</p>
                <p className="font-heading text-5xl font-semibold text-slate-950">${tour.price}</p>
              </div>
              <Button size="lg" className="h-14 rounded-full bg-slate-950 text-lg text-white hover:bg-slate-800 px-10 shadow-xl shadow-slate-200">
                Book this tour
              </Button>
            </div>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-24 space-y-12">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Reviews
            </p>
            <h2 className="font-heading text-4xl font-semibold tracking-tight text-slate-950">Customer Experiences</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <img src={review.userImage || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-950">{review.userName}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  &quot;{review.comment}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
