import { v2 as cloudinary } from "cloudinary";
import { getIntegrations } from "@/lib/integrations";

export type CloudinaryResource = "auto" | "image" | "video";

export async function uploadToCloudinary(
  file: File,
  folder = "tourvibe",
  resourceType: CloudinaryResource = "auto",
): Promise<string> {
  const cfg = await getIntegrations();

  if (!cfg.cloudinaryCloudName || !cfg.cloudinaryApiKey || !cfg.cloudinaryApiSecret) {
    throw new Error("Cloudinary credentials not configured. Set them in Site Config → Integrations.");
  }

  cloudinary.config({
    cloud_name: cfg.cloudinaryCloudName,
    api_key:    cfg.cloudinaryApiKey,
    api_secret: cfg.cloudinaryApiSecret,
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: resourceType }, (err, result) => {
        if (err || !result) {
          console.error("Cloudinary upload error:", err);
          const rawMessage = err?.message || (typeof err === "string" ? err : "Upload failed");
          let cleanMessage = rawMessage;
          if (rawMessage.includes("File size too large") || (err && (err as { http_code?: number }).http_code === 400)) {
            cleanMessage = `File size too large for upload. Cloudinary maximum is 10 MB for images. Please compress the file or choose a smaller image.`;
          }
          return reject(new Error(cleanMessage));
        }
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}

/**
 * Insert Cloudinary delivery transforms into a secure_url.
 * If url is not Cloudinary or transforms already injected, return unchanged.
 */
export function withCloudinaryTransforms(
  url: string,
  transforms: string[] = ["f_auto", "q_auto"],
): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  // Pattern: https://res.cloudinary.com/<cloud>/<resource>/upload/<rest>
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const after = url.slice(idx + marker.length);
  // Skip if first segment already looks like a transform (contains comma or starts with letter_)
  const firstSeg = after.split("/")[0] ?? "";
  if (/^[a-z]_/.test(firstSeg) && firstSeg.includes(",")) return url;
  return `${url.slice(0, idx + marker.length)}${transforms.join(",")}/${after}`;
}

export function cloudinaryImage(url: string, width?: number): string {
  const t = ["f_auto", "q_auto"];
  if (width) t.push(`w_${width}`);
  return withCloudinaryTransforms(url, t);
}

export function cloudinaryVideoPoster(url: string): string {
  if (!url.includes("res.cloudinary.com")) return "";
  return withCloudinaryTransforms(url.replace(/\.(mp4|webm|mov|m4v)$/i, ".jpg"), [
    "f_auto",
    "q_auto",
    "so_2",
  ]);
}

const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i;
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (VIDEO_EXT_RE.test(url)) return true;
  if (url.includes("res.cloudinary.com") && url.includes("/video/upload/")) return true;
  return false;
}
