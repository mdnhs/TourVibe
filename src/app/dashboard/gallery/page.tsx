import { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireDashboardSession, canPerform } from "@/lib/dashboard";
import { AddGalleryItemDialog, EditGalleryItemDialog, DeleteGalleryItemButton } from "./gallery-forms";
import { ImageIcon, Video, Star, Sparkles, Film, Image as PhotoIcon, Layers } from "lucide-react";
import { GalleryItemCard } from "./gallery-item-card";

export const metadata: Metadata = {
  title: "Media Gallery Management | Admin Dashboard",
  description: "Manage uploaded photos and videos for the public tour gallery.",
};

export default async function AdminGalleryPage() {
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "gallery", "read", "Gallery")) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        You do not have permission to manage the media gallery.
      </div>
    );
  }

  const items = (prisma as any).galleryItem
    ? await prisma.galleryItem.findMany({
        orderBy: { createdAt: "desc" },
      })
    : [];

  const photoCount = items.filter((i) => i.type === "IMAGE").length;
  const videoCount = items.filter((i) => i.type === "VIDEO").length;
  const featuredCount = items.filter((i) => i.featured).length;

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  if (!categories.includes("Destinations")) categories.push("Destinations");
  if (!categories.includes("Tours")) categories.push("Tours");
  if (!categories.includes("Vehicles")) categories.push("Vehicles");

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ImageIcon className="size-6 text-primary" />
            Media Gallery Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload, tag, and feature tour photos and promotional videos shown on `/gallery`.
          </p>
        </div>
        <AddGalleryItemDialog categories={categories} />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Media</p>
              <p className="text-xl font-bold">{items.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <PhotoIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Photos</p>
              <p className="text-xl font-bold">{photoCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Video className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Videos</p>
              <p className="text-xl font-bold">{videoCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Star className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Featured</p>
              <p className="text-xl font-bold">{featuredCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center bg-card/50">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Sparkles className="size-6" />
          </div>
          <h3 className="text-base font-semibold">No media in gallery yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Upload images or videos of tour destinations, vehicles, and customer experiences.
          </p>
          <AddGalleryItemDialog categories={categories} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <GalleryItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
