import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await req.json();
  const trimmed = typeof phone === "string" ? phone.trim() : "";
  if (!trimmed) {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { phone: trimmed },
  });

  return NextResponse.json({ success: true });
}
