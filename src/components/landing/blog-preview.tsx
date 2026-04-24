import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarIcon, ImageIcon, PenLine, UserIcon, Sparkles } from "lucide-react";

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
  {
    bar: "from-amber-400 to-orange-500",
    glow: "bg-amber-400/20",
    tagStyle: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700",
    metaBg: "bg-gradient-to-r from-amber-50/80 to-slate-50",
    btnGrad: "from-amber-500 to-orange-600",
    btnShadow: "shadow-amber-500/30",
  },
  {
    bar: "from-indigo-400 to-violet-500",
    glow: "bg-indigo-400/20",
    tagStyle: "bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200 text-indigo-700",
    metaBg: "bg-gradient-to-r from-indigo-50/80 to-slate-50",
    btnGrad: "from-indigo-500 to-violet-600",
    btnShadow: "shadow-indigo-500/30",
  },
  {
    bar: "from-emerald-400 to-teal-500",
    glow: "bg-emerald-400/20",
    tagStyle: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700",
    metaBg: "bg-gradient-to-r from-emerald-50/80 to-slate-50",
    btnGrad: "from-emerald-500 to-teal-600",
    btnShadow: "shadow-emerald-500/30",
  },
];

export function BlogPreview({ posts }: { posts: BlogPost[] }) {

  return (
    <section id="blog" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-indigo-300/10 blur-3xl" />
        <div className="absolute top-1/2 -left-32 size-80 rounded-full bg-violet-300/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 animate-in fade-in slide-in-from-left-4 duration-500">
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
                <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Our Blog</span>
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-indigo-400/50 to-violet-400/50" aria-hidden="true" />
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
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/35 hover:from-indigo-500 hover:to-violet-500 animate-in fade-in slide-in-from-right-4 duration-500"
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
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
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
                  className="group animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-lg shadow-slate-200/60 transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/50"
                >
                  {/* Hover glow */}
                  <div className={`pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />

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
                      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
                        <ImageIcon className="size-10 text-slate-300" />
                        <span className="text-xs font-medium text-slate-400">No cover</span>
                      </div>
                    )}
                    {/* Bottom gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

                    {/* Sparkle badge */}
                    {i === 0 && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                        <Sparkles className="size-2.5" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Accent bar */}
                  <div className={`h-1 w-full shrink-0 bg-gradient-to-r ${accent.bar}`} />

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {/* Tags */}
                    {tagList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tagList.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${accent.tagStyle}`}
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
                    <div className={`flex items-center gap-3 rounded-xl px-3 py-2 border border-slate-100 ${accent.metaBg}`}>
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
                      className={`group/btn mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 ${accent.btnGrad} ${accent.btnShadow}`}
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
