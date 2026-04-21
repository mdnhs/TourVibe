"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, UploadCloud, X } from "lucide-react";

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

import { createBlogPost, updateBlogPost } from "./actions";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  status: string;
}

// ── Cover image uploader ──────────────────────────────────────────────────────

interface CoverImageUploaderProps {
  existingUrl: string;
  onFileChange: (file: File | null, previewUrl: string) => void;
}

function CoverImageUploader({ existingUrl, onFileChange }: CoverImageUploaderProps) {
  const [preview, setPreview] = useState<string>(existingUrl);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are accepted");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileChange(file, url);
  }, [onFileChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview("");
    onFileChange(null, "");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group w-full overflow-hidden rounded-xl border border-border bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Cover preview"
            className="w-full max-h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud className="size-4 mr-1.5" /> Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              <X className="size-4 mr-1.5" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          <div className="rounded-xl bg-muted p-3">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PNG, JPG, WEBP — max 5 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

// ── Shared form fields ────────────────────────────────────────────────────────

interface BlogFormFieldsProps {
  defaults?: Partial<BlogPost>;
  isPending: boolean;
  onSubmit: (formData: FormData) => void;
  submitLabel: string;
  pendingLabel: string;
}

function BlogFormFields({ defaults, isPending, onSubmit, submitLabel, pendingLabel }: BlogFormFieldsProps) {
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!defaults?.slug);
  const [excerpt, setExcerpt] = useState(defaults?.excerpt ?? "");
  const [content, setContent] = useState(defaults?.content ?? "");
  const [tags, setTags] = useState(defaults?.tags ?? "");
  const [metaTitle, setMetaTitle] = useState(defaults?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(defaults?.metaDescription ?? "");
  const [status, setStatus] = useState(defaults?.status ?? "published");

  // Cover image state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverExistingUrl, setCoverExistingUrl] = useState(defaults?.coverImage ?? "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(slugify(val));
  };

  const handleCoverChange = (file: File | null, previewUrl: string) => {
    setCoverFile(file);
    if (!file) setCoverExistingUrl("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!content.trim()) { toast.error("Content is required"); return; }

    const fd = new FormData();
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("excerpt", excerpt);
    fd.set("content", content);
    fd.set("coverImage", coverExistingUrl); // existing URL (empty if removed)
    fd.set("tags", tags);
    fd.set("metaTitle", metaTitle);
    fd.set("metaDescription", metaDescription);
    fd.set("status", status);

    // Attach file if a new one was selected
    if (coverFile) {
      fd.set("coverImageFile", coverFile);
    }

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="blog-title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="blog-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="My Awesome Post"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="blog-slug">Slug</Label>
          <Input
            id="blog-slug"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            placeholder="my-awesome-post"
          />
          {slug && (
            <p className="text-[11px] text-muted-foreground">
              Preview: /blog/<span className="font-mono text-primary">{slug}</span>
            </p>
          )}
        </div>
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="blog-excerpt">Excerpt</Label>
          <span className={`text-[11px] ${excerpt.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
            {excerpt.length}/160
          </span>
        </div>
        <Textarea
          id="blog-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary shown in listings…"
          rows={3}
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label htmlFor="blog-content">
          Content <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="blog-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here. Separate paragraphs with blank lines."
          rows={14}
          className="font-mono text-sm"
          required
        />
      </div>

      {/* Cover image */}
      <div className="space-y-1.5">
        <Label>Cover Image</Label>
        <CoverImageUploader
          existingUrl={defaults?.coverImage ?? ""}
          onFileChange={handleCoverChange}
        />
      </div>

      {/* Tags + Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="blog-tags">
            Tags{" "}
            <span className="text-muted-foreground text-[11px]">(comma-separated)</span>
          </Label>
          <Input
            id="blog-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="travel, ireland, adventure"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="blog-status">Status</Label>
          <Select value={status} onValueChange={setStatus as any}>
            <SelectTrigger id="blog-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
        <p className="text-sm font-semibold">SEO Settings</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="blog-meta-title">Meta Title</Label>
            <span className={`text-[11px] ${metaTitle.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>
              {metaTitle.length}/60
            </span>
          </div>
          <Input
            id="blog-meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="SEO page title (leave blank to use post title)"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="blog-meta-desc">Meta Description</Label>
            <span className={`text-[11px] ${metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
              {metaDescription.length}/160
            </span>
          </div>
          <Textarea
            id="blog-meta-desc"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="SEO description (leave blank to use excerpt)"
            rows={2}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}

// ── Public forms ──────────────────────────────────────────────────────────────

export function CreateBlogPostForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createBlogPost(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Blog post created!");
        router.push("/dashboard/blog");
      }
    });
  };

  return (
    <BlogFormFields
      isPending={isPending}
      onSubmit={handleSubmit}
      submitLabel="Create Post"
      pendingLabel="Creating…"
    />
  );
}

export function EditBlogPostForm({ post }: { post: BlogPost }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateBlogPost(post.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Blog post updated!");
        router.push("/dashboard/blog");
      }
    });
  };

  return (
    <BlogFormFields
      defaults={post}
      isPending={isPending}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      pendingLabel="Saving…"
    />
  );
}
