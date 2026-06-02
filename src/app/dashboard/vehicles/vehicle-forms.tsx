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
import { Car, ImageIcon, UserCog, Video, Trash2 } from "lucide-react";

type Driver = { id: string; name: string; email: string };
interface FormProps {
  drivers: Driver[];
}

const isVideo = (url: string) =>
  /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || /\/video\/upload\//.test(url);

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

// ── Driver select ─────────────────────────────────────────────────────────
function DriverSelect({
  drivers,
  driverId,
  setDriverId,
  disabled,
}: {
  drivers: Driver[];
  driverId: string;
  setDriverId: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Section
      icon={UserCog}
      title="Driver"
      description="Optionally assign a driver to this vehicle."
    >
      <div className="space-y-2">
        <Label htmlFor="driverId">Assigned Driver</Label>
        <Select value={driverId} onValueChange={(v) => setDriverId(v ?? "")} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {driverId === "none"
                ? "No Driver Assigned"
                : drivers.find((d) => d.id === driverId)?.name || "Select a driver"}
            </SelectValue>
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
    </Section>
  );
}

// ── Details fields ─────────────────────────────────────────────────────────
function DetailsFields({
  disabled,
  defaults,
}: {
  disabled?: boolean;
  defaults?: { make?: string; model?: string; year?: number | string; licensePlate?: string };
}) {
  return (
    <Section icon={Car} title="Vehicle Details" description="Basic identification for the vehicle.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="make">Name</Label>
          <Input id="make" name="make" defaultValue={defaults?.make} placeholder="e.g. Toyota" required disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" defaultValue={defaults?.model} placeholder="e.g. Camry" required disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min="1900"
            max="2100"
            defaultValue={defaults?.year}
            placeholder="e.g. 2024"
            required
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input
            id="licensePlate"
            name="licensePlate"
            defaultValue={defaults?.licensePlate}
            placeholder="e.g. ABC-1234"
            required
            disabled={disabled}
          />
        </div>
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
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setGalleryPreviews(files ? Array.from(files).map((f) => URL.createObjectURL(f)) : []);
  };

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
    <form ref={formRef} onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <DetailsFields disabled={isPending} />
          <DriverSelect drivers={drivers} driverId={driverId} setDriverId={setDriverId} disabled={isPending} />
        </div>

        <div className="space-y-5">
          <Section
            icon={ImageIcon}
            title="Media"
            description="A thumbnail is required. Gallery supports images and videos."
          >
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">
                Thumbnail <span className="text-destructive">*</span>
              </Label>
              {thumbnailPreview && (
                <div className="relative mb-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnailPreview} className="size-full object-cover" alt="Thumbnail preview" />
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

            {/* Gallery */}
            <div className="space-y-2">
              <Label htmlFor="gallery">Gallery (optional)</Label>
              {galleryPreviews.length > 0 && (
                <div className="mb-2 grid grid-cols-4 gap-2">
                  {galleryPreviews.map((url, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} className="size-full object-cover" alt={`Preview ${i}`} />
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
          </Section>
        </div>
      </div>

      <ActionBar
        submitLabel="Register Vehicle"
        pendingLabel="Registering..."
        isPending={isPending}
        onCancel={
          <Button asChild variant="outline">
            <Link href="/dashboard/vehicles">Cancel</Link>
          </Button>
        }
      />
    </form>
  );
}

// ── Edit Vehicle Form ─────────────────────────────────────────────────────────
export function EditVehicleForm({
  vehicle,
  drivers,
  onSuccess,
}: FormProps & { vehicle: Vehicle; onSuccess?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [driverId, setDriverId] = useState<string>(vehicle.driverId ?? "none");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [keptGallery, setKeptGallery] = useState<string[]>(
    (vehicle.gallery || "").split(",").map((s) => s.trim()).filter(Boolean),
  );

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setGalleryPreviews(files ? Array.from(files).map((f) => URL.createObjectURL(f)) : []);
  };

  const removeExisting = (url: string) =>
    setKeptGallery((prev) => prev.filter((u) => u !== url));

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
        if (onSuccess) onSuccess();
        else router.push("/dashboard/vehicles");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <DetailsFields
            disabled={isPending}
            defaults={{
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              licensePlate: vehicle.licensePlate,
            }}
          />
          <DriverSelect drivers={drivers} driverId={driverId} setDriverId={setDriverId} disabled={isPending} />
        </div>

        <div className="space-y-5">
          <Section
            icon={ImageIcon}
            title="Media"
            description="Manage thumbnail and gallery files."
          >
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              {thumbnailPreview ? (
                <div className="relative mb-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnailPreview} className="size-full object-cover" alt="New preview" />
                  <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    New
                  </span>
                </div>
              ) : vehicle.thumbnail ? (
                <div className="mb-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={vehicle.thumbnail} className="size-full object-cover" alt="Current thumbnail" />
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
              <p className="text-xs text-muted-foreground">Leave empty to keep the current thumbnail.</p>
              <input type="hidden" name="existingThumbnail" value={vehicle.thumbnail} />
            </div>

            {/* Existing gallery — removable */}
            {keptGallery.length > 0 && (
              <div className="space-y-2">
                <Label>Current Gallery</Label>
                <div className="grid grid-cols-4 gap-2">
                  {keptGallery.map((url) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded border bg-muted"
                    >
                      {isVideo(url) ? (
                        <video src={url} muted className="size-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} className="size-full object-cover" alt="Gallery item" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeExisting(url)}
                        disabled={isPending}
                        aria-label="Remove item"
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add gallery */}
            <div className="space-y-2">
              <Label htmlFor="gallery" className="flex items-center gap-1.5">
                <Video className="size-3.5 text-muted-foreground" />
                Add to Gallery (optional)
              </Label>
              {galleryPreviews.length > 0 && (
                <div className="mb-2 grid grid-cols-4 gap-2">
                  {galleryPreviews.map((url, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} className="size-full object-cover" alt={`Preview ${i}`} />
                      <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        New
                      </span>
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
              <p className="text-xs text-muted-foreground">New files are added to the gallery.</p>
              <input type="hidden" name="existingGallery" value={keptGallery.join(",")} />
            </div>
          </Section>
        </div>
      </div>

      <ActionBar
        submitLabel="Save Changes"
        pendingLabel="Saving..."
        isPending={isPending}
        onCancel={
          <Button
            type="button"
            variant="outline"
            onClick={() => (onSuccess ? onSuccess() : router.push("/dashboard/vehicles"))}
          >
            Cancel
          </Button>
        }
      />
    </form>
  );
}
