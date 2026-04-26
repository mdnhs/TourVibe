import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarIcon, ImageIcon, TagIcon, UserIcon } from "lucide-react";

import { db } from "@/lib/db";
import { getSeoSettingsSync, buildMetadata, buildBlogPostSchema } from "@/lib/seo";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  status: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string | null;
  createdAt: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
  });

  if (!post) return {};

  const s = await getSeoSettingsSync();
  return buildMetadata(s, {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    canonical: `/blog/${post.slug}`,
    image: post.coverImage,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postRaw = await db.blogPost.findUnique({
    where: { slug },
  });

  if (!postRaw || postRaw.status !== "published") {
    notFound();
  }

  const post: BlogPost = {
    ...postRaw,
    createdAt: postRaw.createdAt.toISOString(),
    publishedAt: postRaw.publishedAt?.toISOString() || null,
  };

  const relatedPostsRaw = await db.blogPost.findMany({
    where: {
      status: "published",
      id: { not: post.id },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const relatedPosts: BlogPost[] = relatedPostsRaw.map(
    (rp: (typeof relatedPostsRaw)[number]) => ({
      ...rp,
      createdAt: rp.createdAt.toISOString(),
      publishedAt: rp.publishedAt?.toISOString() || null,
    })
  );

  const s = await getSeoSettingsSync();
  const jsonLdSchema = buildBlogPostSchema(s, post);

  const tagList = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const displayDate = post.publishedAt ?? post.createdAt;

  // Render content: split by double newlines into paragraphs
  const paragraphs = post.content.split(/\n\n+/).filter((p) => p.trim());

  return (
    <div className="min-h-screen">
      {jsonLdSchema && (
        <Script
          id={`blog-post-schema-${post.id}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {post.coverImage ? (
          <div className="absolute inset-0">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover opacity-25"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 size-80 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>
        )}

        <div className="relative mx-auto max-w-4xl px-4 py-24 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white mb-8"
          >
            <ArrowLeft className="size-4" />
            Back to Blog
          </Link>

          {/* Tags */}
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tagList.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300"
                >
                  <TagIcon className="size-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-white/60 leading-8 mb-8 max-w-2xl">{post.excerpt}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-amber-400/20 flex items-center justify-center">
                <UserIcon className="size-4 text-amber-400" />
              </div>
              <span className="font-medium text-white/70">{post.authorName || "TourVibe"}</span>
            </div>
            <span className="text-white/30">·</span>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" />
              {new Date(displayDate).toLocaleDateString("en-IE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-slate max-w-none">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-slate-700 leading-8 text-base mb-6 last:mb-0"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {para.trim()}
              </p>
            ))}
          </div>

          {/* Tags footer */}
          {tagList.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-8">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-1">Tags:</span>
              {tagList.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="relative overflow-hidden bg-slate-50 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-950 mb-8">
              More from our blog
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => {
                const rpDate = rp.publishedAt ?? rp.createdAt;
                const rpTags = rp.tags ? rp.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
                return (
                  <article
                    key={rp.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      {rp.coverImage ? (
                        <Image
                          src={rp.coverImage}
                          alt={rp.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <ImageIcon className="size-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      {rpTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rpTags.slice(0, 2).map((tag) => (
                            <span key={tag} className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className="font-semibold text-sm text-slate-950 line-clamp-2 leading-snug group-hover:text-slate-700 transition-colors">
                        {rp.title}
                      </h3>
                      {rp.excerpt && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-5">{rp.excerpt}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {new Date(rpDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
                        </span>
                        <Link
                          href={`/blog/${rp.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-950 hover:text-amber-600 transition-colors"
                        >
                          Read
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
