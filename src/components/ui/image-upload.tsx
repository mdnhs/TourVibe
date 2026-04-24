"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, UploadCloudIcon, XCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  folder?: string;
  aspectRatio?: "square" | "wide";
}

export function ImageUploadField({
  name,
  label,
  defaultValue = "",
  hint,
  folder = "tourvibe/site-config",
  aspectRatio = "wide",
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  const isSquare = aspectRatio === "square";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Hidden input carries value for form submission */}
      <input type="hidden" name={name} value={url} />

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200",
          dragOver
            ? "border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30"
            : "border-border bg-muted/20 hover:border-indigo-300/70 hover:bg-muted/30",
          isSquare ? "aspect-square max-w-[180px]" : "aspect-video",
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
      >
        {url ? (
          <>
            <Image
              src={url}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/45 hover:opacity-100">
              <UploadCloudIcon className="size-7 text-white drop-shadow" />
              <span className="text-xs font-semibold text-white drop-shadow">Replace</span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
            {uploading ? (
              <Loader2 className="size-8 animate-spin text-indigo-500" />
            ) : (
              <>
                <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60">
                  <ImageIcon className="size-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {dragOver ? "Drop to upload" : "Click or drag to upload"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">PNG, JPG, WebP · max 10 MB</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Upload progress overlay */}
        {uploading && url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="gap-1.5 text-xs"
        >
          {uploading ? (
            <><Loader2 className="size-3.5 animate-spin" /> Uploading…</>
          ) : (
            <><UploadCloudIcon className="size-3.5" /> {url ? "Replace" : "Upload"}</>
          )}
        </Button>

        {url && !uploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUrl("")}
            className="gap-1.5 text-xs text-destructive hover:text-destructive"
          >
            <XCircleIcon className="size-3.5" /> Remove
          </Button>
        )}

        {url && !uploading && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2Icon className="size-3.5" /> Uploaded
          </span>
        )}

        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>

      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
