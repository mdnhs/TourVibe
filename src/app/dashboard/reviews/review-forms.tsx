"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";

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
    reviewerName?: string | null;
    reviewerImage?: string | null;
  };
}

function StarRating({ 
  rating, 
  setRating, 
  editable = true 
}: { 
  rating: number; 
  setRating?: (r: number) => void; 
  editable?: boolean 
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-6 cursor-pointer transition-colors",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
            !editable && "cursor-default"
          )}
          onClick={() => editable && setRating?.(star)}
        />
      ))}
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
        if (onSuccess) {
          onSuccess?.();
        } else {
          router.push("/dashboard/reviews");
        }
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="tourPackageId">Tour Package</Label>
        <Select 
          name="tourPackageId" 
          value={tourPackageId} 
          onValueChange={(value) => setTourPackageId(value ?? "")} 
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a tour package">
              {tourPackageId 
                ? tourPackages.find(p => p.id === tourPackageId)?.name 
                : undefined}
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

      <div className="grid gap-2">
        <Label>Rating</Label>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="Share your experience..."
          rows={4}
        />
      </div>

      {isSuperAdmin && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="reviewerName">Reviewer Name (Admin Only)</Label>
            <Input
              id="reviewerName"
              name="reviewerName"
              placeholder="Custom reviewer name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reviewerImage">Reviewer Image (Admin Only)</Label>
            <Input
              id="reviewerImage"
              name="reviewerImage"
              type="file"
              accept="image/*"
            />
          </div>
        </>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
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
        if (onSuccess) {
          onSuccess?.();
        } else {
          router.push("/dashboard/reviews");
        }
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="tourPackageId">Tour Package</Label>
        <Select 
          name="tourPackageId" 
          value={tourPackageId} 
          onValueChange={(value) => setTourPackageId(value ?? "")} 
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a tour package">
              {tourPackageId 
                ? tourPackages.find(p => p.id === tourPackageId)?.name 
                : undefined}
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

      <div className="grid gap-2">
        <Label>Rating</Label>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          name="comment"
          defaultValue={review.comment ?? ""}
          placeholder="Share your experience..."
          rows={4}
        />
      </div>

      {isSuperAdmin && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="reviewerName">Reviewer Name (Admin Only)</Label>
            <Input
              id="reviewerName"
              name="reviewerName"
              defaultValue={review.reviewerName ?? ""}
              placeholder="Custom reviewer name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reviewerImage">Reviewer Image (Admin Only)</Label>
            {review.reviewerImage && (
              <div className="size-12 rounded-full overflow-hidden border">
                <img src={review.reviewerImage} alt="current" className="size-full object-cover" />
              </div>
            )}
            <Input
              id="reviewerImage"
              name="reviewerImage"
              type="file"
              accept="image/*"
            />
          </div>
        </>
      )}

      <div className="flex gap-2 justify-end">
        {onSuccess && (
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Review"}
        </Button>
      </div>
    </form>
  );
}
