import { v2 as cloudinary } from "cloudinary";
import { getIntegrations } from "@/lib/integrations";

export async function uploadToCloudinary(
  file: File,
  folder = "tourvibe",
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
      .upload_stream({ folder, resource_type: "auto" }, (err, result) => {
        if (err || !result) {
          console.error("Cloudinary upload error:", err);
          return reject(err instanceof Error ? err : new Error(err?.message || "Upload failed"));
        }
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}
