"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Star, Video, Image as PhotoIcon, Edit, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EditGalleryItemDialog, DeleteGalleryItemButton } from "./gallery-forms";
import { toggleFeaturedGalleryItem } from "./actions";

interface GalleryItem {
  id: string;
  title: string | null;
  caption: string | null;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  category: string;
  location?: string | null;
  featured: boolean;
  createdAt: Date;
}

export function GalleryItemCard({ item }: { item: GalleryItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleFeatured = () => {
    startTransition(async () => {
      const res = await toggleFeaturedGalleryItem(item.id, !item.featured);
      if (res?.error) toast.error(res.error);
      else toast.success(item.featured ? "Unmarked as featured" : "Marked as featured");
    });
  };

  const isVideo = item.type === "VIDEO";

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-all hover:shadow-md">
        {/* Media Preview Header */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900">
          {isVideo ? (
            item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.title || "Gallery video"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <video
                src={item.url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            )
          ) : (
            <img
              src={item.url}
              alt={item.title || "Gallery image"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Type Badge & Featured Tag */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold backdrop-blur-md shadow-xs ${
                isVideo
                  ? "bg-amber-500/90 text-white"
                  : "bg-slate-900/80 text-white"
              }`}
            >
              {isVideo ? <Video className="size-3" /> : <PhotoIcon className="size-3" />}
              {isVideo ? "Video" : "Photo"}
            </span>

            <span className="rounded-md bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-xs">
              {item.category}
            </span>
          </div>

          {/* Video Play Overlay */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
                <Play className="size-5 fill-slate-900 ml-0.5" />
              </div>
            </div>
          )}

          {/* Toggle Featured Button */}
          <button
            type="button"
            onClick={handleToggleFeatured}
            disabled={isPending}
            className={`absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-md ${
              item.featured
                ? "bg-amber-400 text-slate-950 scale-110"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
            title={item.featured ? "Featured item" : "Mark as featured"}
          >
            <Star className={`size-4 ${item.featured ? "fill-slate-950" : ""}`} />
          </button>
        </div>

        {/* Card Content & Action Bar */}
        <div className="flex flex-1 flex-col justify-between p-3.5">
          <div>
            <h4 className="font-semibold text-sm line-clamp-1 text-foreground">
              {item.title || "Untitled Media"}
            </h4>
            {item.caption && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {item.caption}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-2.5">
            <span className="text-[11px] text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditOpen(true)}
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Edit className="size-4" />
              </Button>
              <DeleteGalleryItemButton id={item.id} />
            </div>
          </div>
        </div>
      </div>

      {editOpen && (
        <EditGalleryItemDialog
          item={item}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </>
  );
}
