import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarIcon, ImageIcon, UserIcon } from "lucide-react";

import { db } from "@/lib/db";
import { getSeoSettingsSync, buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = getSeoSettingsSync();
  return buildMetadata(s, { title: "Blog", canonical: "/blog" });
}

type BlogPost = {
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

const cardColors = [
  { bar: "from-amber-400 to-orange-500", tagBg: "bg-amber-50 border-amber-200 text-amber-700" },
  { bar: "from-cyan-400 to-sky-500",     tagBg: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  { bar: "from-emerald-400 to-teal-500", tagBg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
];

export default async function BlogListPage() {
  const posts = db
    .prepare(`
      SELECT id, title, slug, excerpt, coverImage, authorName, tags, publishedAt, createdAt
      FROM blog_post
      WHERE status = 'published'
      ORDER BY publishedAt DESC, createdAt DESC
    `)
    .all() as BlogPost[];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-24 sm:px-6 text-white">
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 size-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-amber-400" />
            </span>
            TourVibe Blog
          </div>
          <h1 className="font-heading text-5xl font-extrabold tracking-tight sm:text-6xl">
            Stories from the{" "}
            <span className="relative inline-block">
              <span className="relative z-10">road</span>
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
            </span>
          </h1>
          <p className="mx-auto max-w-lg text-base leading-7 text-white/55">
            Travel tips, destination guides, and insider stories from TourVibe — your companion for car-based adventures across Ireland.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 right-1/4 size-96 rounded-full bg-cyan-300/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 size-96 rounded-full bg-amber-300/8 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <ImageIcon className="size-7 text-slate-300" />
              </div>
              <p className="text-xl font-semibold text-slate-700">No posts yet</p>
              <p className="text-sm text-slate-400">Check back soon for travel stories and tips.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => {
                const accent = cardColors[i % cardColors.length];
                const tagList = post.tags
                  ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
                  : [];
                const date = post.publishedAt ?? post.createdAt;

                return (
                  <article
                    key={post.id}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                               relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white
                               shadow-lg shadow-slate-200/60
                               transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
                  >
                    {/* Cover */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 bg-linear-to-br from-slate-100 to-slate-200">
                          <ImageIcon className="size-10 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
                    </div>

                    {/* Top accent bar */}
                    <div className={`h-1 w-full bg-linear-to-r ${accent.bar}`} />

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      {/* Tags */}
                      {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tagList.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accent.tagBg}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <h2 className="font-heading text-lg font-bold text-slate-950 leading-snug group-hover:text-slate-700 transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-xs leading-6 text-slate-500 line-clamp-3">{post.excerpt}</p>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <UserIcon className="size-3 text-slate-400" />
                          {post.authorName || "TourVibe"}
                        </div>
                        <div className="h-3.5 w-px bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <CalendarIcon className="size-3 text-slate-400" />
                          {new Date(date).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
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
    </div>
  );
}
