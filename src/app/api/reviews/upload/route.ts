import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 400 });
  }

  try {
    const url = await uploadToCloudinary(file, "tourvibe/reviews", "image");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Review photo upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
