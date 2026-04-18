import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!payload.name || !payload.email || !payload.password) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 },
    );
  }

  const response = await auth.api.createUser({
    headers: await headers(),
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: "driver",
    },
  });

  return NextResponse.json(response);
}
