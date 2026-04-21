import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarIcon, ImageIcon, PenLine, UserIcon } from "lucide-react";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string;
  authorName: string;
  tags: string;
  publishedAt: string | null;
  createdAt: string;
};

const cardAccents = [
  { bar: "from-amber-400 to-orange-500",  tag: "bg-amber-50 border-amber-200 text-amber-700" },
  { bar: "from-cyan-400 to-sky-500",      tag: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  { bar: "from-emerald-400 to-teal-500",  tag: "bg-emerald-50 border-emerald-200 text-emerald-700" },
];

export function BlogPreview({ posts }: { posts: BlogPost[] }) {

  return (
    <section id="blog" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 size-125 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute top-1/2 -left-32 size-80 rounded-full bg-violet-300/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-amber-600" />
              </span>
              Latest Stories
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              From{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Our Blog</span>
                <span className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
              </span>
            </h2>

            <p
              className="max-w-md text-sm leading-7 text-slate-500 animate-in fade-in duration-500"
              style={{ animationDelay: "140ms" }}
            >
              Travel tips, destination guides and insider stories from the TourVibe team.
            </p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            View All Posts
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Cards grid or empty state */}
        {posts.length === 0 ? (
          <div
            className="mt-12 flex flex-col items-center justify-center gap-5 rounded-[2rem] border border-dashed border-slate-200 bg-white/60 py-20 text-center backdrop-blur-sm animate-in fade-in duration-500"
            style={{ animationDelay: "200ms" }}
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <PenLine className="size-8 text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-slate-700">No posts yet</p>
              <p className="text-sm text-slate-400">
                Check back soon — stories are on their way.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              Visit the blog
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const accent = cardAccents[i % cardAccents.length];
              const tagList = post.tags
                ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
                : [];
              const date = post.publishedAt ?? post.createdAt;

              return (
                <article
                  key={post.id}
                  style={{ animationDelay: `${200 + i * 80}ms` }}
                  className="group animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-lg shadow-slate-200/60 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
                >
                  {/* Cover image */}
                  <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-100">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 bg-linear-to-br from-slate-100 to-slate-200">
                        <ImageIcon className="size-10 text-slate-300" />
                        <span className="text-xs font-medium text-slate-400">No cover</span>
                      </div>
                    )}
                    {/* Bottom gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
                  </div>

                  {/* Accent bar */}
                  <div className={`h-1 w-full shrink-0 bg-linear-to-r ${accent.bar}`} />

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {/* Tags */}
                    {tagList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tagList.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${accent.tag}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title + excerpt */}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-heading text-[17px] font-bold leading-snug text-slate-950 line-clamp-2 transition-colors group-hover:text-slate-700">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs leading-6 text-slate-500 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Author + date */}
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <UserIcon className="size-3 text-slate-400" />
                        <span className="truncate max-w-20">{post.authorName || "TourVibe"}</span>
                      </div>
                      <div className="h-3 w-px bg-slate-200" />
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <CalendarIcon className="size-3 text-slate-400" />
                        {new Date(date).toLocaleDateString("en-IE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group/btn mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800"
                    >
                      Read more
                      <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
