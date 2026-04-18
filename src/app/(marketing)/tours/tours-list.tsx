import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  maxPersons: number;
  thumbnail: string;
  reviewCount: number;
  avgRating: number | null;
}

interface ToursListProps {
  tours: Tour[];
}

export function ToursList({ tours }: ToursListProps) {
  if (tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <Clock className="size-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No tours found</h3>
        <p className="mt-2 text-slate-500">
          Try adjusting your filters to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour) => (
        <Card
          key={tour.id}
          className="group overflow-hidden rounded-2xl border-slate-200/70 bg-white transition-all hover:shadow-xl hover:shadow-slate-200/50 p-0 gap-3"
        >
          <div className="relative aspect-16/10 overflow-hidden">
            <Image
              src={tour.thumbnail || "/placeholder.svg"}
              alt={tour.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute right-4 top-4">
              <Badge className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-slate-900 backdrop-blur-sm hover:bg-white">
                ${tour.price}
              </Badge>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="size-3.5 fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {tour.avgRating ? tour.avgRating.toFixed(1) : "New"}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {tour.reviewCount} reviews
              </span>
            </div>
            <h3 className="mb-2 font-heading text-xl font-semibold text-slate-950 line-clamp-1">
              {tour.name}
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-600 line-clamp-2">
              {tour.description}
            </p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  <Clock className="size-3.5 text-cyan-600" />
                  {tour.duration}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  <Users className="size-3.5 text-cyan-600" />
                  {tour.maxPersons} Max
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3">
            <Button
              asChild
              className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 cursor-pointer"
            >
              <Link href={`/tours/${tour.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
