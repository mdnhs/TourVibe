import { Star } from "lucide-react";

interface Review {
  name: string;
  role: string;
  quote: string;
}

interface ReviewsProps {
  reviews: Review[];
}

export function Reviews({ reviews }: ReviewsProps) {
  return (
    <section id="reviews" className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Tourist Reviews
          </p>
          <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight">
            Social proof for your car-tour experience
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="flex gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-white/75">“{review.quote}”</p>
              <div className="mt-6">
                <p className="font-medium">{review.name}</p>
                <p className="text-sm text-white/50">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
