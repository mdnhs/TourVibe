import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadToCloudinary(
  file: File,
  folder = "tourvibe",
): Promise<string> {
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
