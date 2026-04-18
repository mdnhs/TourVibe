import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/session";

type ActionPayload =
  | {
      action: "set-role";
      userId?: string;
      role?: "super_admin" | "driver" | "tourist";
    }
  | {
      action: "ban";
      userId?: string;
      banReason?: string;
    }
  | {
      action: "unban";
      userId?: string;
    }
  | {
      action: "set-password";
      userId?: string;
      newPassword?: string;
    };

async function requireSuperAdmin() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "super_admin") {
    return null;
  }

  return session;
}

export async function POST(request: Request) {
  const session = await requireSuperAdmin();

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as ActionPayload;

  if (!payload.userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  const requestHeaders = await headers();

  switch (payload.action) {
    case "set-role": {
      if (!payload.role) {
        return NextResponse.json({ error: "Role is required." }, { status: 400 });
      }

      const response = await auth.api.setRole({
        headers: requestHeaders,
        body: {
          userId: payload.userId,
          role: payload.role,
        },
      });

      return NextResponse.json(response);
    }
    case "ban": {
      const response = await auth.api.banUser({
        headers: requestHeaders,
        body: {
          userId: payload.userId,
          banReason: payload.banReason || "Access suspended by super admin.",
        },
      });

      return NextResponse.json(response);
    }
    case "unban": {
      const response = await auth.api.unbanUser({
        headers: requestHeaders,
        body: {
          userId: payload.userId,
        },
      });

      return NextResponse.json(response);
    }
    case "set-password": {
      if (!payload.newPassword || payload.newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters." },
          { status: 400 },
        );
      }

      const response = await auth.api.setUserPassword({
        headers: requestHeaders,
        body: {
          userId: payload.userId,
          newPassword: payload.newPassword,
        },
      });

      return NextResponse.json(response);
    }
    default:
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }
}
