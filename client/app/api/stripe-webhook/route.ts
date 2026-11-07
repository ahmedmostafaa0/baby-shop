import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

async function syncOrderStatus(
  orderId: string,
  status: "paid" | "cancelled",
  session: Stripe.Checkout.Session,
) {
  const apiEndpoint =
    process.env.API_ENDPOINT ||
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    "http://localhost:5000/api";
  const syncSecret = process.env.STRIPE_WEBHOOK_SYNC_SECRET;
  if (!syncSecret) throw new Error("Stripe webhook sync secret is not configured");

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const response = await fetch(`${apiEndpoint}/orders/${encodeURIComponent(orderId)}/webhook-status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": syncSecret,
    },
    body: JSON.stringify({
      status,
      stripeSessionId: session.id,
      ...(status === "paid" && paymentIntentId ? { paymentIntentId } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Order sync failed: ${response.status} ${response.statusText} - ${detail}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeSecretKey || !endpointSecret) {
      console.error("Stripe webhook environment is not configured");
      return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-01-28.clover" });
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No Stripe signature found" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid signature";
      console.error("Stripe webhook signature verification failed:", message);
      return NextResponse.json({ error: "Invalid Stripe webhook signature" }, { status: 400 });
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId || !/^[a-f\\d]{24}$/i.test(orderId)) {
        return NextResponse.json({ error: "Missing or invalid order ID in Stripe metadata" }, { status: 400 });
      }

      if (event.type === "checkout.session.completed") {
        // A completed event is not proof of a successful payment for delayed methods.
        if (session.payment_status !== "paid") {
          return NextResponse.json({ received: true, ignored: "payment_not_paid" });
        }
        await syncOrderStatus(orderId, "paid", session);
      } else {
        await syncOrderStatus(orderId, "cancelled", session);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    // A 500 asks Stripe to retry transient backend synchronization failures.
    return NextResponse.json({ error: "Failed to process Stripe webhook" }, { status: 500 });
  }
}
