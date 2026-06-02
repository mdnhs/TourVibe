"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, MessageSquare, UserCog, Trash2, ImageIcon } from "lucide-react";

import { createReview, updateReview } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  onSuccess?: () => void;
  isSuperAdmin?: boolean;
}

interface CreateReviewFormProps extends ReviewFormProps {
  tourPackages: { id: string; name: string }[];
}

interface EditReviewFormProps extends ReviewFormProps {
  tourPackages: { id: string; name: string }[];
  review: {
    id: string;
    tourPackageId: string;
    rating: number;
    comment: string | null;
    photos?: string | null;
    reviewerName?: string | null;
    reviewerImage?: string | null;
  };
}

// ── Section wrapper ─────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold leading-none">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function StarRating({
  rating,
  setRating,
  editable = true,
}: {
  rating: number;
  setRating?: (r: number) => void;
  editable?: boolean;
}) {
  const [hover, setHover] = React.useState(0);
  const active = hover || rating;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "size-7 transition-colors",
              star <= active ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40",
              editable ? "cursor-pointer" : "cursor-default",
            )}
            onClick={() => editable && setRating?.(star)}
            onMouseEnter={() => editable && setHover(star)}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-muted-foreground tabular-nums">{rating} / 5</span>
    </div>
  );
}

function TourPackageSelect({
  tourPackages,
  tourPackageId,
  setTourPackageId,
}: {
  tourPackages: { id: string; name: string }[];
  tourPackageId: string;
  setTourPackageId: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tourPackageId">Tour Package</Label>
      <Select
        name="tourPackageId"
        value={tourPackageId}
        onValueChange={(value) => setTourPackageId(value ?? "")}
        required
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a tour package">
            {tourPackageId ? tourPackages.find((p) => p.id === tourPackageId)?.name : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {tourPackages.map((pkg) => (
            <SelectItem key={pkg.id} value={pkg.id}>
              {pkg.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Review photos ─────────────────────────────────────────────────────────
function PhotosField({ initial = [], disabled }: { initial?: string[]; disabled?: boolean }) {
  const [kept, setKept] = React.useState<string[]>(initial);
  const [previews, setPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setPreviews(files ? Array.from(files).map((f) => URL.createObjectURL(f)) : []);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="photos" className="flex items-center gap-1.5">
        <ImageIcon className="size-3.5 text-muted-foreground" />
        Photos <span className="text-xs font-normal text-muted-foreground">(optional)</span>
      </Label>

      {(kept.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-4 gap-2">
          {kept.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} className="size-full object-cover" alt="Review photo" />
              <button
                type="button"
                onClick={() => setKept((prev) => prev.filter((u) => u !== url))}
                disabled={disabled}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {previews.map((url, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} className="size-full object-cover" alt={`New photo ${i}`} />
              <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                New
              </span>
            </div>
          ))}
        </div>
      )}

      <Input
        id="photos"
        name="photos"
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={onChange}
      />
      <input type="hidden" name="existingPhotos" value={kept.join(",")} />
    </div>
  );
}

// ── Reviewer identity (admin) ─────────────────────────────────────────────────
function ReviewerSection({
  defaultName,
  currentImage,
}: {
  defaultName?: string;
  currentImage?: string | null;
}) {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const shown = preview || currentImage;

  return (
    <Section
      icon={UserCog}
      title="Reviewer Identity"
      description="Admin only — override the displayed reviewer."
    >
      <div className="space-y-2">
        <Label htmlFor="reviewerName">Reviewer Name</Label>
        <Input
          id="reviewerName"
          name="reviewerName"
          defaultValue={defaultName ?? ""}
          placeholder="Custom reviewer name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reviewerImage">Reviewer Image</Label>
        {shown && (
          <div className="size-16 overflow-hidden rounded-full border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shown} alt="Reviewer" className="size-full object-cover" />
          </div>
        )}
        <Input id="reviewerImage" name="reviewerImage" type="file" accept="image/*" onChange={onChange} />
      </div>
    </Section>
  );
}

// ── Sticky action bar ─────────────────────────────────────────────────────────
function ActionBar({
  submitLabel,
  pendingLabel,
  isPending,
  onCancel,
}: {
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onCancel: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 -mx-1 flex gap-3 border-t bg-background/80 px-1 py-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Button type="submit" className="flex-1 sm:flex-none sm:min-w-48" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
      {onCancel}
    </div>
  );
}

export function CreateReviewForm({ tourPackages, onSuccess, isSuperAdmin }: CreateReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [rating, setRating] = React.useState(5);
  const [tourPackageId, setTourPackageId] = React.useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("rating", rating.toString());
    formData.set("tourPackageId", tourPackageId);

    startTransition(async () => {
      const result = await createReview(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Review submitted successfully");
        if (onSuccess) onSuccess();
        else router.push("/dashboard/reviews");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <Section
          icon={MessageSquare}
          title="Review Details"
          description="Pick a tour, set a rating, and write the review."
        >
          <TourPackageSelect
            tourPackages={tourPackages}
            tourPackageId={tourPackageId}
            setTourPackageId={setTourPackageId}
          />
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea id="comment" name="comment" placeholder="Share your experience..." rows={5} />
          </div>
          <PhotosField disabled={isPending} />
        </Section>

        {isSuperAdmin && <ReviewerSection />}
      </div>

      <ActionBar
        submitLabel="Submit Review"
        pendingLabel="Submitting..."
        isPending={isPending}
        onCancel={
          onSuccess ? (
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/dashboard/reviews">Cancel</Link>
            </Button>
          )
        }
      />
    </form>
  );
}

export function EditReviewForm({ review, tourPackages, onSuccess, isSuperAdmin }: EditReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [rating, setRating] = React.useState(review.rating);
  const [tourPackageId, setTourPackageId] = React.useState<string>(review.tourPackageId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("rating", rating.toString());
    formData.set("tourPackageId", tourPackageId);

    startTransition(async () => {
      const result = await updateReview(review.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Review updated successfully");
        if (onSuccess) onSuccess();
        else router.push("/dashboard/reviews");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <Section
          icon={MessageSquare}
          title="Review Details"
          description="Update the tour, rating, or comment."
        >
          <TourPackageSelect
            tourPackages={tourPackages}
            tourPackageId={tourPackageId}
            setTourPackageId={setTourPackageId}
          />
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              name="comment"
              defaultValue={review.comment ?? ""}
              placeholder="Share your experience..."
              rows={5}
            />
          </div>
          <PhotosField
            disabled={isPending}
            initial={(review.photos ?? "").split(",").map((s) => s.trim()).filter(Boolean)}
          />
        </Section>

        {isSuperAdmin && (
          <ReviewerSection defaultName={review.reviewerName ?? ""} currentImage={review.reviewerImage} />
        )}
      </div>

      <ActionBar
        submitLabel="Update Review"
        pendingLabel="Updating..."
        isPending={isPending}
        onCancel={
          onSuccess ? (
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/dashboard/reviews">Cancel</Link>
            </Button>
          )
        }
      />
    </form>
  );
}
