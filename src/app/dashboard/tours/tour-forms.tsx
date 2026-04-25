"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTour, updateTour } from "./actions";
import { TourPackage } from "./tour-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Plus, X } from "lucide-react";

function HighlightsEditor({ initial = [] }: { initial?: string[] }) {
  const [items, setItems] = useState<string[]>(initial.length > 0 ? initial : [""]);

  const update = (i: number, val: string) =>
    setItems((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const add = () => setItems((prev) => [...prev, ""]);

  const remove = (i: number) =>
    setItems((prev) => prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            name="highlights"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Highlight ${i + 1}`}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} className="shrink-0">
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="size-3.5" />
        Add Highlight
      </Button>
    </div>
  );
}

interface FormProps {
  vehicles: { id: string; make: string; model: string; licensePlate: string }[];
}

// ── Create Tour Form ──────────────────────────────────────────────────────────

export function CreateTourForm({ vehicles }: FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setGalleryPreviews(urls);
    } else {
      setGalleryPreviews([]);
    }
  };

  const toggleVehicle = (id: string) => {
    setSelectedVehicles(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  // Cleanup object URLs
  React.useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbnailPreview, galleryPreviews]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    formData.delete("vehicleIds");
    selectedVehicles.forEach(id => formData.append("vehicleIds", id));

    startTransition(async () => {
      const result = await createTour(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Tour package created successfully");
        router.push("/dashboard/tours");
        router.refresh();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Package Name</Label>
        <Input id="name" name="name" placeholder="e.g. Dreamy Sylhet Getaway" required disabled={isPending} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" name="price" type="number" step="0.01" placeholder="99.99" required disabled={isPending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input id="duration" name="duration" placeholder="e.g. 3 Days / 2 Nights" required disabled={isPending} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxPersons">Max Persons</Label>
        <Input id="maxPersons" name="maxPersons" type="number" min="1" placeholder="e.g. 6" required disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Describe the tour highlights..." className="min-h-[100px]" disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label>Tour Highlights</Label>
        <HighlightsEditor />
      </div>

      <div className="space-y-2">
        <Label>Assign Vehicles</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`vehicle-${v.id}`} 
                checked={selectedVehicles.includes(v.id)}
                onCheckedChange={() => toggleVehicle(v.id)}
                disabled={isPending}
              />
              <label htmlFor={`vehicle-${v.id}`} className="text-xs font-medium leading-none cursor-pointer">
                {v.make} {v.model} ({v.licensePlate})
              </label>
            </div>
          ))}
          {vehicles.length === 0 && <p className="text-xs text-muted-foreground italic">No vehicles available</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail (Mandatory)</Label>
        {thumbnailPreview && (
          <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border mb-2">
            <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Thumbnail preview" />
          </div>
        )}
        <Input 
          id="thumbnail" 
          name="thumbnail" 
          type="file" 
          accept="image/*" 
          required 
          disabled={isPending} 
          onChange={handleThumbnailChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gallery">Gallery (Optional, multiple)</Label>
        {galleryPreviews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-2">
            {galleryPreviews.map((url, i) => (
              <div key={i} className="aspect-square rounded border overflow-hidden bg-muted">
                <img src={url} className="w-full h-full object-cover" alt={`Preview ${i}`} />
              </div>
            ))}
          </div>
        )}
        <Input 
          id="gallery" 
          name="gallery" 
          type="file" 
          accept="image/*,video/*" 
          multiple 
          disabled={isPending} 
          onChange={handleGalleryChange}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Creating..." : "Create Tour Package"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/tours">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

// ── Edit Tour Form ────────────────────────────────────────────────────────────

export function EditTourForm({ 
  tour, 
  vehicles,
  onSuccess
}: { tour: TourPackage; vehicles: any[]; onSuccess?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(
    tour.assignedVehicles?.split(",").filter(Boolean) || []
  );

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setGalleryPreviews(urls);
    } else {
      setGalleryPreviews([]);
    }
  };

  const toggleVehicle = (id: string) => {
    setSelectedVehicles(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbnailPreview, galleryPreviews]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    formData.delete("vehicleIds");
    selectedVehicles.forEach(id => formData.append("vehicleIds", id));

    startTransition(async () => {
      const result = await updateTour(tour.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Tour package updated successfully");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/tours");
        }
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Package Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={tour.name} 
          required 
          disabled={isPending} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            step="0.01" 
            defaultValue={tour.price} 
            required 
            disabled={isPending} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input 
            id="duration" 
            name="duration" 
            defaultValue={tour.duration} 
            required 
            disabled={isPending} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxPersons">Max Persons</Label>
        <Input 
          id="maxPersons" 
          name="maxPersons" 
          type="number" 
          min="1" 
          defaultValue={tour.maxPersons} 
          required 
          disabled={isPending} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={tour.description || ""}
          className="min-h-[100px]"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label>Tour Highlights</Label>
        <HighlightsEditor initial={tour.highlights?.split("\n").filter(Boolean) ?? []} />
      </div>

      <div className="space-y-2">
        <Label>Assign Vehicles</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`edit-vehicle-${v.id}`} 
                checked={selectedVehicles.includes(v.id)}
                onCheckedChange={() => toggleVehicle(v.id)}
                disabled={isPending}
              />
              <label htmlFor={`edit-vehicle-${v.id}`} className="text-xs font-medium leading-none cursor-pointer">
                {v.make} {v.model} ({v.licensePlate})
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail</Label>
        {thumbnailPreview ? (
          <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border mb-2">
            <img src={thumbnailPreview} className="w-full h-full object-cover" alt="New preview" />
          </div>
        ) : tour.thumbnail ? (
          <div className="w-40 aspect-video rounded border overflow-hidden mb-2">
            <img src={tour.thumbnail} className="w-full h-full object-cover" alt="current" />
          </div>
        ) : null}
        <Input 
          id="thumbnail" 
          name="thumbnail" 
          type="file" 
          accept="image/*" 
          disabled={isPending} 
          onChange={handleThumbnailChange}
        />
        <input type="hidden" name="existingThumbnail" value={tour.thumbnail} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gallery">Add to Gallery (Optional)</Label>
        {galleryPreviews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-2">
            {galleryPreviews.map((url, i) => (
              <div key={i} className="aspect-square rounded border overflow-hidden bg-muted">
                <img src={url} className="w-full h-full object-cover" alt={`Preview ${i}`} />
              </div>
            ))}
          </div>
        )}
        <Input 
          id="gallery" 
          name="gallery" 
          type="file" 
          accept="image/*,video/*" 
          multiple 
          disabled={isPending} 
          onChange={handleGalleryChange}
        />
        <input type="hidden" name="existingGallery" value={tour.gallery || ""} />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={() => onSuccess ? onSuccess() : router.push("/dashboard/tours")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
