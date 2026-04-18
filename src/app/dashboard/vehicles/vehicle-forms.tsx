"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createVehicle, updateVehicle } from "./actions";
import { Vehicle } from "./vehicle-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface FormProps {
  drivers: { id: string; name: string; email: string }[];
}

// ── Create Vehicle Form ───────────────────────────────────────────────────────

export function CreateVehicleForm({ drivers }: FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [driverId, setDriverId] = useState<string>("none");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

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

  // Cleanup object URLs to avoid memory leaks
  React.useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbnailPreview, galleryPreviews]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("driverId", driverId);

    startTransition(async () => {
      const result = await createVehicle(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Vehicle registered successfully");
        router.push("/dashboard/vehicles");
        router.refresh();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Name</Label>
          <Input id="make" name="make" placeholder="e.g. Toyota" required disabled={isPending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" placeholder="e.g. Camry" required disabled={isPending} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" min="1900" max="2100" placeholder="e.g. 2024" required disabled={isPending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input id="licensePlate" name="licensePlate" placeholder="e.g. ABC-1234" required disabled={isPending} />
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
        <p className="text-xs text-muted-foreground">Supports images and videos (MP4).</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="driverId">Assign Driver (Optional)</Label>
        <Select value={driverId} onValueChange={setDriverId} disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="Select a driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Driver Assigned</SelectItem>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.name} ({driver.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Registering..." : "Register Vehicle"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/vehicles">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

// ── Edit Vehicle Form ─────────────────────────────────────────────────────────

export function EditVehicleForm({ 
  vehicle, 
  drivers,
  onSuccess
}: FormProps & { vehicle: Vehicle; onSuccess?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [driverId, setDriverId] = useState<string>(vehicle.driverId ?? "none");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

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
    formData.set("driverId", driverId);

    startTransition(async () => {
      const result = await updateVehicle(vehicle.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Vehicle updated successfully");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/vehicles");
        }
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Name</Label>
          <Input 
            id="make" 
            name="make" 
            defaultValue={vehicle.make} 
            required 
            disabled={isPending} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input 
            id="model" 
            name="model" 
            defaultValue={vehicle.model} 
            required 
            disabled={isPending} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input 
            id="year" 
            name="year" 
            type="number" 
            defaultValue={vehicle.year} 
            required 
            disabled={isPending} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input 
            id="licensePlate" 
            name="licensePlate" 
            defaultValue={vehicle.licensePlate} 
            required 
            disabled={isPending} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail (Mandatory)</Label>
        {thumbnailPreview ? (
          <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border mb-2">
            <img src={thumbnailPreview} className="w-full h-full object-cover" alt="New preview" />
          </div>
        ) : vehicle.thumbnail ? (
          <div className="w-20 h-20 rounded border overflow-hidden mb-2">
            <img src={vehicle.thumbnail} className="w-full h-full object-cover" alt="current" />
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
        <input type="hidden" name="existingThumbnail" value={vehicle.thumbnail} />
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
        <input type="hidden" name="existingGallery" value={vehicle.gallery || ""} />
        <p className="text-xs text-muted-foreground">New files will be added to the existing gallery.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="driverId">Assign Driver (Optional)</Label>
        <Select value={driverId} onValueChange={setDriverId} disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="Select a driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Driver Assigned</SelectItem>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.name} ({driver.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={() => onSuccess ? onSuccess() : router.push("/dashboard/vehicles")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
