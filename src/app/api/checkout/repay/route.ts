import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getIntegrations } from "@/lib/integrations";
import { requireDashboardSession } from "@/lib/dashboard";

export async function GET(req: NextRequest) {
  try {
    const { session } = await requireDashboardSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const integrations = await getIntegrations();
    if (!integrations.stripeSecretKey) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
    }

    const stripe = new Stripe(integrations.stripeSecretKey, {
      apiVersion: "2023-10-16" as any,
    });

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Stripe session URL not found" }, { status: 404 });
    }

    return NextResponse.redirect(checkoutSession.url);
  } catch (error: any) {
    console.error("Repay Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
