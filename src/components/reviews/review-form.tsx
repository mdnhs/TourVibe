"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MAX_PHOTOS = 5;

interface ExistingReview {
  id: string;
  rating: number;
  comment: string | null;
  photos: string[];
}

interface ReviewFormProps {
  tourPackageId: string;
  existing?: ExistingReview | null;
}

export function ReviewForm({ tourPackageId, existing }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(existing?.rating ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>(existing?.comment ?? "");
  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      toast.error(`Up to ${MAX_PHOTOS} photos.`);
      e.target.value = "";
      return;
    }
    const toUpload = files.slice(0, room);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/reviews/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Upload failed");
          continue;
        }
        uploaded.push(data.url);
      }
      if (uploaded.length) setPhotos((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Pick a rating between 1 and 5.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourPackageId, rating, comment, photos }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error || "Failed to submit review");
        return;
      }
      toast.success(existing ? "Review updated" : "Review submitted");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!confirm("Delete your review?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${existing.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete");
        return;
      }
      toast.success("Review deleted");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg sm:text-xl font-bold text-slate-950">
          {existing ? "Update your review" : "Share your experience"}
        </h3>
        {existing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
          </Button>
        )}
      </div>

      <div>
        <Label className="mb-2 block text-sm">Your rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
            >
              <Star
                className={
                  "size-7 sm:size-8 transition-colors " +
                  ((hover || rating) >= n
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300")
                }
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-slate-500">
            {rating > 0 ? `${rating} / 5` : "Tap a star"}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="review-comment" className="mb-2 block text-sm">
          Comment <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you enjoy? Anything to improve?"
          rows={4}
          maxLength={2000}
        />
      </div>

      <div>
        <Label className="mb-2 block text-sm">
          Photos <span className="text-xs font-normal text-muted-foreground">(optional, up to {MAX_PHOTOS})</span>
        </Label>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
            {photos.map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  aria-label="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < MAX_PHOTOS && (
          <label
            className={
              "flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 " +
              (uploading ? "opacity-60 pointer-events-none" : "")
            }
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {uploading ? "Uploading…" : `Add photos (${photos.length}/${MAX_PHOTOS})`}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={handlePhotoUpload}
            />
          </label>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || rating < 1}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : existing ? (
            "Update review"
          ) : (
            "Submit review"
          )}
        </Button>
      </div>
    </form>
  );
}
