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
import TiptapEditor from "@/components/tiptap-editor";
import Link from "next/link";
import {
  Plus,
  X,
  Search,
  Sparkles,
  ImageIcon,
  Video,
  Car,
  Info,
  Tag,
  Users,
  Clock,
  Euro,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Vehicle = { id: string; make: string; model: string; licensePlate: string };

const MAX_IMAGE_BYTES = 1024 * 1024;
const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

function validateVideo(e: React.ChangeEvent<HTMLInputElement>): boolean {
  const file = e.target.files?.[0];
  if (file && file.size > MAX_VIDEO_BYTES) {
    toast.error(`"${file.name}" is over 10MB. Please choose a smaller video.`);
    e.target.value = "";
    return false;
  }
  return true;
}

function collectValidImages(list: FileList | null): File[] {
  const incoming = Array.from(list ?? []);
  const valid: File[] = [];
  const tooBig: string[] = [];
  for (const f of incoming) {
    if (f.size > MAX_IMAGE_BYTES) tooBig.push(f.name);
    else valid.push(f);
  }
  if (tooBig.length) {
    toast.error(`Skipped (over 1MB): ${tooBig.join(", ")}`);
  }
  return valid;
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function HighlightsEditor({ initial = [] }: { initial?: string[] }) {
  const [items, setItems] = useState<string[]>(initial.length > 0 ? initial : [""]);

  const update = (i: number, val: string) =>
    setItems((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const add = () => setItems((prev) => [...prev, ""]);

  const remove = (i: number) =>
    setItems((prev) => (prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i)));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
            {i + 1}
          </span>
          <Input
            name="highlights"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder="e.g. Scenic coastal drive along the Wild Atlantic Way"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(i)}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
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

function BasicsFields({
  disabled,
  defaults,
}: {
  disabled?: boolean;
  defaults?: {
    name?: string;
    description?: string;
    price?: number | string;
    hourlyRate?: number | string;
    durationHours?: number | string;
    maxPersons?: number | string;
    price2?: number | string | null;
    maxPersons2?: number | string | null;
    hourlyRate2?: number | string | null;
    baseHours2?: number | string | null;
  };
}) {
  const [description, setDescription] = useState(defaults?.description ?? "");

  // Variant 1 state
  const [basePrice1, setBasePrice1] = useState(
    defaults?.price?.toString() ??
    (defaults?.hourlyRate && defaults?.durationHours
      ? (Number(defaults.hourlyRate) * Number(defaults.durationHours)).toString()
      : "")
  );
  const [baseHours1, setBaseHours1] = useState(defaults?.durationHours?.toString() ?? "4");
  const [extraRate1, setExtraRate1] = useState(defaults?.hourlyRate?.toString() ?? "40");
  const [maxPersons1, setMaxPersons1] = useState(defaults?.maxPersons?.toString() ?? "4");

  // Variant 2 state
  const [enableVariant2, setEnableVariant2] = useState<boolean>(
    Boolean(defaults?.maxPersons2 || defaults?.price2 || defaults?.hourlyRate2)
  );
  const [basePrice2, setBasePrice2] = useState(defaults?.price2?.toString() ?? "");
  const [baseHours2, setBaseHours2] = useState(
    defaults?.baseHours2?.toString() ?? defaults?.durationHours?.toString() ?? "4"
  );
  const [extraRate2, setExtraRate2] = useState(defaults?.hourlyRate2?.toString() ?? "");
  const [maxPersons2, setMaxPersons2] = useState(defaults?.maxPersons2?.toString() ?? "6");

  const price1Num = parseFloat(basePrice1) || 0;
  const hours1Num = parseInt(baseHours1) || 1;
  const extraRate1Num = parseFloat(extraRate1) || 0;

  const price2Num = parseFloat(basePrice2) || 0;
  const hours2Num = parseInt(baseHours2) || hours1Num;
  const extraRate2Num = parseFloat(extraRate2) || 0;

  return (
    <>
      <Section icon={Info} title="Basics" description="Name and description shown to travelers.">
        <div className="space-y-2">
          <Label htmlFor="name">Package Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaults?.name}
            placeholder="e.g. Dreamy Sylhet Getaway"
            required
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <TiptapEditor
            content={description}
            onChange={setDescription}
            disabled={disabled}
          />
          <input type="hidden" name="description" value={description} />
        </div>
      </Section>

      <Section
        icon={Tag}
        title="Pricing & Capacity"
        description="Set base price and base hours for up to 2 variants. If travelers increase hours, the extra hourly rate is added."
      >
        {/* Variant 1 Section */}
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/20">
              Variant 1 (Primary)
            </span>
            <span className="text-xs text-muted-foreground">Standard group capacity &amp; base rate</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="flex items-center gap-1 text-xs">
                <Euro className="size-3.5 text-muted-foreground" />
                Base Price (€)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={basePrice1}
                onChange={(e) => setBasePrice1(e.target.value)}
                placeholder="200"
                required
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="durationHours" className="flex items-center gap-1 text-xs">
                <Clock className="size-3.5 text-muted-foreground" />
                Base Hours
              </Label>
              <Input
                id="durationHours"
                name="durationHours"
                type="number"
                min="1"
                step="1"
                value={baseHours1}
                onChange={(e) => setBaseHours1(e.target.value)}
                placeholder="4"
                required
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hourlyRate" className="flex items-center gap-1 text-xs">
                <Euro className="size-3.5 text-muted-foreground" />
                Extra Rate (€/hr)
              </Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={extraRate1}
                onChange={(e) => setExtraRate1(e.target.value)}
                placeholder="40"
                required
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxPersons" className="flex items-center gap-1 text-xs">
                <Users className="size-3.5 text-muted-foreground" />
                Max Persons (V1)
              </Label>
              <Input
                id="maxPersons"
                name="maxPersons"
                type="number"
                min="1"
                value={maxPersons1}
                onChange={(e) => setMaxPersons1(e.target.value)}
                placeholder="4"
                required
                disabled={disabled}
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              Variant 1 Summary: Base price <span className="font-bold text-emerald-600">€{price1Num.toFixed(2)}</span> includes <span className="font-bold">{hours1Num} hours</span> for up to <span className="font-bold">{maxPersons1} persons</span>.
            </p>
            <p className="mt-0.5 text-[11px]">
              If traveler books beyond {hours1Num} hours: +€{extraRate1Num.toFixed(2)} per additional hour.
            </p>
          </div>
        </div>

        {/* Variant 2 Section */}
        {!enableVariant2 ? (
          <div className="border-t pt-4">
            <input type="hidden" name="enableVariant2" value="false" />
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5 text-center transition-all hover:border-amber-500/40 hover:bg-amber-500/5">
              <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Plus className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Add 2nd Pricing Variant</h4>
                <p className="text-xs text-muted-foreground">
                  Customize base price, base hours, and extra rates for larger group sizes (e.g. up to 6 or 8 persons).
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEnableVariant2(true)}
                  disabled={disabled}
                  className="mt-2 border-amber-500/30 bg-amber-500/10 font-bold text-amber-600 hover:bg-amber-500/20 hover:text-amber-700 dark:text-amber-400"
                >
                  <Plus className="mr-1.5 size-4" />
                  Add Variant 2
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t pt-4 space-y-4">
            <input type="hidden" name="enableVariant2" value="true" />
            <div className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 border border-amber-500/20">
                    Variant 2
                  </span>
                  <span className="text-xs text-muted-foreground">Secondary capacity &amp; base pricing</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnableVariant2(false)}
                  disabled={disabled}
                  className="h-8 px-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-1.5 size-3.5" />
                  Remove Variant
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price2" className="flex items-center gap-1 text-xs">
                    <Euro className="size-3.5 text-muted-foreground" />
                    Base Price 2 (€)
                  </Label>
                  <Input
                    id="price2"
                    name="price2"
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice2}
                    onChange={(e) => setBasePrice2(e.target.value)}
                    placeholder="250"
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="baseHours2" className="flex items-center gap-1 text-xs">
                    <Clock className="size-3.5 text-muted-foreground" />
                    Base Hours 2
                  </Label>
                  <Input
                    id="baseHours2"
                    name="baseHours2"
                    type="number"
                    min="1"
                    step="1"
                    value={baseHours2}
                    onChange={(e) => setBaseHours2(e.target.value)}
                    placeholder="4"
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hourlyRate2" className="flex items-center gap-1 text-xs">
                    <Euro className="size-3.5 text-muted-foreground" />
                    Extra Rate 2 (€/hr)
                  </Label>
                  <Input
                    id="hourlyRate2"
                    name="hourlyRate2"
                    type="number"
                    step="0.01"
                    min="0"
                    value={extraRate2}
                    onChange={(e) => setExtraRate2(e.target.value)}
                    placeholder="50"
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxPersons2" className="flex items-center gap-1 text-xs">
                    <Users className="size-3.5 text-muted-foreground" />
                    Max Persons (V2)
                  </Label>
                  <Input
                    id="maxPersons2"
                    name="maxPersons2"
                    type="number"
                    min="1"
                    value={maxPersons2}
                    onChange={(e) => setMaxPersons2(e.target.value)}
                    placeholder="6"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  Variant 2 Summary: Base price <span className="font-bold text-amber-600">€{price2Num.toFixed(2)}</span> includes <span className="font-bold">{hours2Num} hours</span> for up to <span className="font-bold">{maxPersons2} persons</span>.
                </p>
                <p className="mt-0.5 text-[11px]">
                  If traveler books beyond {hours2Num} hours: +€{extraRate2Num.toFixed(2)} per additional hour.
                </p>
              </div>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}

function SeoFields({
  disabled,
  defaults,
}: {
  disabled?: boolean;
  defaults?: { metaTitle?: string; metaDescription?: string };
}) {
  const [metaTitle, setMetaTitle] = useState(defaults?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(defaults?.metaDescription ?? "");

  return (
    <Section
      icon={Search}
      title="SEO"
      description="Overrides for search result title and description."
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <span
            className={`text-[11px] ${metaTitle.length > 60 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {metaTitle.length}/60
          </span>
        </div>
        <Input
          id="metaTitle"
          name="metaTitle"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder="SEO page title (leave blank to use tour name)"
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <span
            className={`text-[11px] ${metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {metaDescription.length}/160
          </span>
        </div>
        <Textarea
          id="metaDescription"
          name="metaDescription"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="SEO description (leave blank to use tour description)"
          rows={2}
          disabled={disabled}
        />
      </div>
    </Section>
  );
}

function VehiclePicker({
  vehicles,
  selected,
  onToggle,
  disabled,
  idPrefix,
}: {
  vehicles: Vehicle[];
  selected: string[];
  onToggle: (id: string) => void;
  disabled: boolean;
  idPrefix: string;
}) {
  return (
    <Section
      icon={Car}
      title="Assign Vehicles"
      description={
        selected.length > 0
          ? `${selected.length} vehicle${selected.length === 1 ? "" : "s"} selected`
          : "Select which vehicles can run this tour."
      }
    >
      {vehicles.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">No vehicles available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {vehicles.map((v) => {
            const active = selected.includes(v.id);
            return (
              <label
                key={v.id}
                htmlFor={`${idPrefix}-${v.id}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                  active ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                )}
              >
                <Checkbox
                  id={`${idPrefix}-${v.id}`}
                  checked={active}
                  onCheckedChange={() => onToggle(v.id)}
                  disabled={disabled}
                />
                <span className="flex flex-col leading-tight">
                  <span className="font-medium">
                    {v.make} {v.model}
                  </span>
                  <span className="text-xs text-muted-foreground">{v.licensePlate}</span>
                </span>
              </label>
            );
          })}
        </div>
      )}
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

// ── Create Tour Form ──────────────────────────────────────────────────────────
export function CreateTourForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_IMAGE_BYTES) {
      toast.error(`"${file.name}" is over 1MB. Please choose a smaller image.`);
      e.target.value = "";
      setThumbnailPreview(null);
      return;
    }
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const added = collectValidImages(e.target.files);
    e.target.value = "";
    if (added.length) setGalleryFiles((prev) => [...prev, ...added]);
  };

  const removeGalleryAt = (i: number) =>
    setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i));

  const toggleVehicle = (id: string) =>
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  React.useEffect(() => {
    const urls = galleryFiles.map((f) => URL.createObjectURL(f));
    setGalleryPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [galleryFiles]);

  React.useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.delete("vehicleIds");
    selectedVehicles.forEach((id) => formData.append("vehicleIds", id));
    formData.delete("gallery");
    galleryFiles.forEach((f) => formData.append("gallery", f));

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
    <form ref={formRef} onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <BasicsFields disabled={isPending} />

          <Section
            icon={Sparkles}
            title="Tour Highlights"
            description="Key selling points shown as bullet points."
          >
            <HighlightsEditor />
          </Section>

          <SeoFields disabled={isPending} />
        </div>

        <div className="space-y-5">
          <VehiclePicker
            vehicles={vehicles}
            selected={selectedVehicles}
            onToggle={toggleVehicle}
            disabled={isPending}
            idPrefix="vehicle"
          />

          <Section
            icon={ImageIcon}
            title="Media"
            description="A thumbnail is required. Add 8–10 gallery photos for a complete listing."
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
              <Label htmlFor="gallery">Gallery Photos</Label>
              {galleryPreviews.length > 0 && (
                <div className="mb-2 grid grid-cols-4 gap-2">
                  {galleryPreviews.map((url, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} className="size-full object-cover" alt={`Preview ${i}`} />
                      <button
                        type="button"
                        onClick={() => removeGalleryAt(i)}
                        disabled={isPending}
                        className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                        aria-label="Remove photo"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Input
                id="gallery"
                name="gallery"
                type="file"
                accept="image/*"
                multiple
                disabled={isPending}
                onChange={handleGalleryChange}
              />
              <p className="text-xs text-muted-foreground">
                Max 1MB per image. Selecting more photos adds to the list.
              </p>
              {galleryPreviews.length > 0 && galleryPreviews.length < 8 && (
                <p className="text-xs text-amber-600">
                  Add at least 8 photos for a complete listing ({galleryPreviews.length} selected).
                </p>
              )}
            </div>

            {/* Promo video */}
            <div className="space-y-2">
              <Label htmlFor="promoVideo" className="flex items-center gap-1.5">
                <Video className="size-3.5 text-muted-foreground" />
                Promotional Video (optional)
              </Label>
              <Input id="promoVideo" name="promoVideo" type="file" accept="video/*" disabled={isPending} onChange={validateVideo} />
              <p className="text-xs text-muted-foreground">
                Max 10MB. Short clip (under ~90s) describing location, attractions, and visitor experience.
              </p>
            </div>
          </Section>
        </div>
      </div>

      <ActionBar
        submitLabel="Create Tour Package"
        pendingLabel="Creating..."
        isPending={isPending}
        onCancel={
          <Button asChild variant="outline">
            <Link href="/dashboard/tours">Cancel</Link>
          </Button>
        }
      />
    </form>
  );
}

// ── Edit Tour Form ────────────────────────────────────────────────────────────
export function EditTourForm({
  tour,
  vehicles,
  onSuccess,
}: {
  tour: TourPackage;
  vehicles: Vehicle[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [keptGallery, setKeptGallery] = useState<string[]>(
    (tour.gallery || "").split(",").map((s) => s.trim()).filter(Boolean),
  );
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(
    tour.assignedVehicles?.split(",").filter(Boolean) || [],
  );

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_IMAGE_BYTES) {
      toast.error(`"${file.name}" is over 1MB. Please choose a smaller image.`);
      e.target.value = "";
      setThumbnailPreview(null);
      return;
    }
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const added = collectValidImages(e.target.files);
    e.target.value = "";
    if (added.length) setGalleryFiles((prev) => [...prev, ...added]);
  };

  const removeGalleryAt = (i: number) =>
    setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i));

  const toggleVehicle = (id: string) =>
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  const removeExisting = (url: string) =>
    setKeptGallery((prev) => prev.filter((u) => u !== url));

  React.useEffect(() => {
    const urls = galleryFiles.map((f) => URL.createObjectURL(f));
    setGalleryPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [galleryFiles]);

  React.useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.delete("vehicleIds");
    selectedVehicles.forEach((id) => formData.append("vehicleIds", id));
    formData.delete("gallery");
    galleryFiles.forEach((f) => formData.append("gallery", f));

    startTransition(async () => {
      const result = await updateTour(tour.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Tour package updated successfully");
        if (onSuccess) onSuccess();
        else router.push("/dashboard/tours");
        router.refresh();
      }
    });
  };

  const totalPhotos = keptGallery.length + galleryPreviews.length;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <BasicsFields
            disabled={isPending}
            defaults={{
              name: tour.name,
              description: tour.description || "",
              price: tour.price,
              hourlyRate: tour.hourlyRate ?? 0,
              durationHours: tour.durationHours ?? 1,
              maxPersons: tour.maxPersons,
              price2: tour.price2,
              maxPersons2: tour.maxPersons2,
              hourlyRate2: tour.hourlyRate2,
              baseHours2: tour.baseHours2,
            }}
          />

          <Section
            icon={Sparkles}
            title="Tour Highlights"
            description="Key selling points shown as bullet points."
          >
            <HighlightsEditor initial={tour.highlights?.split("\n").filter(Boolean) ?? []} />
          </Section>

          <SeoFields
            disabled={isPending}
            defaults={{
              metaTitle: tour.metaTitle ?? "",
              metaDescription: tour.metaDescription ?? "",
            }}
          />
        </div>

        <div className="space-y-5">
          <VehiclePicker
            vehicles={vehicles}
            selected={selectedVehicles}
            onToggle={toggleVehicle}
            disabled={isPending}
            idPrefix="edit-vehicle"
          />

          <Section
            icon={ImageIcon}
            title="Media"
            description="Manage thumbnail, gallery photos, and promotional video."
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
              ) : tour.thumbnail ? (
                <div className="mb-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tour.thumbnail} className="size-full object-cover" alt="Current thumbnail" />
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
              <p className="text-xs text-muted-foreground">
                Leave empty to keep the current thumbnail.
              </p>
              <input type="hidden" name="existingThumbnail" value={tour.thumbnail} />
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} className="size-full object-cover" alt="Gallery image" />
                      <button
                        type="button"
                        onClick={() => removeExisting(url)}
                        disabled={isPending}
                        aria-label="Remove image"
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
              <Label htmlFor="gallery">Add Photos</Label>
              {galleryPreviews.length > 0 && (
                <div className="mb-2 grid grid-cols-4 gap-2">
                  {galleryPreviews.map((url, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} className="size-full object-cover" alt={`Preview ${i}`} />
                      <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeGalleryAt(i)}
                        disabled={isPending}
                        aria-label="Remove photo"
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Input
                id="gallery"
                name="gallery"
                type="file"
                accept="image/*"
                multiple
                disabled={isPending}
                onChange={handleGalleryChange}
              />
              <p className="text-xs text-muted-foreground">
                Max 1MB per image. Selecting more photos adds to the list (existing photos are kept).
              </p>
              {totalPhotos < 8 ? (
                <p className="text-xs text-amber-600">
                  {totalPhotos} photo{totalPhotos === 1 ? "" : "s"} total. Add at least{" "}
                  {8 - totalPhotos} more to reach 8.
                </p>
              ) : (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  {totalPhotos} photos total — meets minimum.
                </p>
              )}
              <input type="hidden" name="existingGallery" value={keptGallery.join(",")} />
            </div>

            {/* Promo video */}
            <div className="space-y-2">
              <Label htmlFor="promoVideo" className="flex items-center gap-1.5">
                <Video className="size-3.5 text-muted-foreground" />
                Promotional Video (optional)
              </Label>
              {tour.promoVideoUrl ? (
                <div className="mb-2 w-full max-w-sm overflow-hidden rounded-lg border bg-muted">
                  <video src={tour.promoVideoUrl} controls preload="metadata" className="w-full" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No promotional video uploaded yet.</p>
              )}
              <Input id="promoVideo" name="promoVideo" type="file" accept="video/*" disabled={isPending} onChange={validateVideo} />
              <p className="text-xs text-muted-foreground">
                Max 10MB. Uploading a new file replaces the current promotional video.
              </p>
              <input type="hidden" name="existingPromoVideoUrl" value={tour.promoVideoUrl || ""} />
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
            onClick={() => (onSuccess ? onSuccess() : router.push("/dashboard/tours"))}
          >
            Cancel
          </Button>
        }
      />
    </form>
  );
}
