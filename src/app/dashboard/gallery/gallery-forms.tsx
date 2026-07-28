"use client";

import { useState, useTransition } from "react";
import { Plus, Upload, Video, Image as ImageIcon, Sparkles, Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createGalleryItem, updateGalleryItem, deleteGalleryItem, toggleFeaturedGalleryItem } from "./actions";

interface AddGalleryItemDialogProps {
  categories?: string[];
  onSuccess?: () => void;
}

export function AddGalleryItemDialog({ categories = ["Destinations", "Tours", "Vehicles", "Events", "General"], onSuccess }: AddGalleryItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [uploadMode, setUploadMode] = useState<"FILE" | "URL">("FILE");
  const [featured, setFeatured] = useState(false);
  const [category, setCategory] = useState("General");
  const [customCategory, setCustomCategory] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("featured", featured ? "true" : "false");
    formData.set("category", customCategory.trim() || category);

    startTransition(async () => {
      const res = await createGalleryItem(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Gallery item added successfully");
        setOpen(false);
        onSuccess?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 font-semibold shadow-md"><Plus className="size-4" /> Add Media to Gallery</Button>} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            Add Gallery Item
          </DialogTitle>
          <DialogDescription>
            Upload a photo or video to display on the public gallery page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Media Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Media Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(val) => setType(val as "IMAGE" | "VIDEO")}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                  type === "IMAGE"
                    ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                    : "bg-card hover:bg-accent/50"
                }`}
              >
                <RadioGroupItem value="IMAGE" className="sr-only" />
                <ImageIcon className="size-4" />
                Photo / Image
              </Label>
              <Label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                  type === "VIDEO"
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/20"
                    : "bg-card hover:bg-accent/50"
                }`}
              >
                <RadioGroupItem value="VIDEO" className="sr-only" />
                <Video className="size-4" />
                Video
              </Label>
            </RadioGroup>
          </div>

          {/* Upload Method */}
          <div className="flex items-center justify-between text-xs font-semibold border-b pb-2">
            <span>Media Source</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode("FILE")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  uploadMode === "FILE" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("URL")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  uploadMode === "URL" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Media URL
              </button>
            </div>
          </div>

          {uploadMode === "FILE" ? (
            <div className="space-y-2">
              <Label htmlFor="mediaFile" className="text-xs">
                Upload {type === "VIDEO" ? "Video (MP4/MOV up to 50MB)" : "Photo (JPEG/PNG up to 10MB)"} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mediaFile"
                name="mediaFile"
                type="file"
                accept={type === "VIDEO" ? "video/*" : "image/*"}
                required
                disabled={isPending}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="url" className="text-xs">
                Direct Media URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder={type === "VIDEO" ? "https://res.cloudinary.com/.../video.mp4" : "https://images.unsplash.com/..."}
                required
                disabled={isPending}
              />
            </div>
          )}

          {/* Optional video poster thumbnail */}
          {type === "VIDEO" && (
            <div className="space-y-1.5">
              <Label htmlFor="thumbnailFile" className="text-xs">
                Video Thumbnail Image <span className="text-muted-foreground font-normal">(Optional poster card)</span>
              </Label>
              <Input
                id="thumbnailFile"
                name="thumbnailFile"
                type="file"
                accept="image/*"
                disabled={isPending}
              />
            </div>
          )}

          {/* Title & Caption */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs">Title / Caption Header</Label>
            <Input id="title" name="title" placeholder="e.g. Gap of Dunloe Scenic Tour" disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption" className="text-xs">Description / Subtitle</Label>
            <Textarea id="caption" name="caption" rows={2} placeholder="Optional detailed caption..." disabled={isPending} />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs">Category Tag</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium"
                disabled={isPending}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Custom">+ Custom Category</option>
              </select>
            </div>

            {category === "Custom" && (
              <div className="space-y-1.5">
                <Label htmlFor="customCategory" className="text-xs">Custom Tag</Label>
                <Input
                  id="customCategory"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Wildlife"
                  required
                  disabled={isPending}
                />
              </div>
            )}

            <div className="space-y-1.5 flex flex-col justify-end">
              <div className="flex items-center gap-2 rounded-lg border p-2.5">
                <Checkbox id="featured" checked={featured} onCheckedChange={(c) => setFeatured(!!c)} disabled={isPending} />
                <Label htmlFor="featured" className="text-xs font-medium cursor-pointer">
                  Feature on Gallery Top
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditGalleryItemDialog({
  item,
  open,
  onOpenChange,
}: {
  item: { id: string; title?: string | null; caption?: string | null; category?: string; featured?: boolean };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [featured, setFeatured] = useState(item.featured ?? false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("featured", featured ? "true" : "false");

    startTransition(async () => {
      const res = await updateGalleryItem(item.id, formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Gallery item updated");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Gallery Item</DialogTitle>
          <DialogDescription>Update metadata and display category.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs">Title</Label>
            <Input id="title" name="title" defaultValue={item.title ?? ""} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption" className="text-xs">Caption / Subtitle</Label>
            <Textarea id="caption" name="caption" defaultValue={item.caption ?? ""} rows={2} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs">Category Tag</Label>
            <Input id="category" name="category" defaultValue={item.category ?? "General"} disabled={isPending} />
          </div>

          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Checkbox id="edit-featured" checked={featured} onCheckedChange={(c) => setFeatured(!!c)} disabled={isPending} />
            <Label htmlFor="edit-featured" className="text-xs font-medium cursor-pointer">
              Featured Item
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteGalleryItemButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this media from gallery?")) return;
    startTransition(async () => {
      const res = await deleteGalleryItem(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Item removed from gallery");
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}
