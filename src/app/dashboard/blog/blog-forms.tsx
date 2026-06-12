"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FileText,
  ImageIcon,
  Info,
  Search,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";

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
import TiptapEditor from "@/components/tiptap-editor";

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
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

// ── Char counter ──────────────────────────────────────────────────────────────
function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <span
      className={`text-[11px] ${value.length > max ? "text-destructive" : "text-muted-foreground"}`}
    >
      {value.length}/{max}
    </span>
  );
}

// ── Sticky action bar ─────────────────────────────────────────────────────────
function ActionBar({
  submitLabel,
  pendingLabel,
  isPending,
}: {
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
}) {
  return (
    <div className="sticky bottom-0 -mx-1 flex gap-3 border-t bg-background/80 px-1 py-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Button type="submit" className="flex-1 sm:flex-none sm:min-w-48" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
      <Button asChild variant="outline">
        <Link href="/dashboard/blog">Cancel</Link>
      </Button>
    </div>
  );
}

// ── Cover image uploader ──────────────────────────────────────────────────────

interface CoverImageUploaderProps {
  existingUrl: string;
  onFileChange: (file: File | null, previewUrl: string) => void;
  disabled?: boolean;
}

function CoverImageUploader({ existingUrl, onFileChange, disabled }: CoverImageUploaderProps) {
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
    if (disabled) return;
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
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud className="size-4 mr-1.5" /> Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={disabled}
              onClick={handleRemove}
            >
              <X className="size-4 mr-1.5" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
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
        disabled={disabled}
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Section icon={Info} title="Basics" description="Title and URL slug for this post.">
            <div className="space-y-2">
              <Label htmlFor="blog-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="blog-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="My Awesome Post"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-slug">Slug</Label>
              <Input
                id="blog-slug"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                placeholder="my-awesome-post"
                disabled={isPending}
              />
              {slug && (
                <p className="text-[11px] text-muted-foreground">
                  Preview: /blog/<span className="font-mono text-primary">{slug}</span>
                </p>
              )}
            </div>
          </Section>

          <Section
            icon={FileText}
            title="Content"
            description="Excerpt shown in listings, body shown on the post page."
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="blog-excerpt">Excerpt</Label>
                <CharCount value={excerpt} max={160} />
              </div>
              <Textarea
                id="blog-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary shown in listings…"
                rows={3}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-content">
                Content <span className="text-destructive">*</span>
              </Label>
              <TiptapEditor
                content={content}
                onChange={setContent}
                disabled={isPending}
              />
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section
            icon={ImageIcon}
            title="Cover Image"
            description="Shown in listings and at the top of the post."
          >
            <CoverImageUploader
              existingUrl={defaults?.coverImage ?? ""}
              onFileChange={handleCoverChange}
              disabled={isPending}
            />
          </Section>

          <Section
            icon={Tag}
            title="Publishing"
            description="Tags for discovery and the post's visibility."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="blog-tags">
                  Tags{" "}
                  <span className="text-muted-foreground text-[11px]">(comma-separated)</span>
                </Label>
                <Input
                  id="blog-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="travel, ireland, adventure"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v ?? "published")}
                  disabled={isPending}
                >
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
          </Section>

          <Section
            icon={Search}
            title="SEO"
            description="Overrides for search result title and description."
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="blog-meta-title">Meta Title</Label>
                <CharCount value={metaTitle} max={60} />
              </div>
              <Input
                id="blog-meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO page title (leave blank to use post title)"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="blog-meta-desc">Meta Description</Label>
                <CharCount value={metaDescription} max={160} />
              </div>
              <Textarea
                id="blog-meta-desc"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO description (leave blank to use excerpt)"
                rows={2}
                disabled={isPending}
              />
            </div>
          </Section>
        </div>
      </div>

      <ActionBar
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
        isPending={isPending}
      />
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
