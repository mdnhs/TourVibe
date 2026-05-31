import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidE164, normalizeWhatsapp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { whatsapp } = await req.json();
  const normalized = typeof whatsapp === "string" ? normalizeWhatsapp(whatsapp) : "";
  if (!isValidE164(normalized)) {
    return NextResponse.json(
      { error: "WhatsApp number must be in international format, e.g. +14155551234" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { whatsapp: normalized },
  });

  return NextResponse.json({ success: true });
}
