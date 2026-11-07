import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

interface CheckoutSummary {
  orderId: string;
  status: "pending";
  total: number;
  customerEmail?: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (typeof orderId !== "string" || !/^[a-f\d]{24}$/i.test(orderId)) {
      return NextResponse.json({ error: "A valid order ID is required" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const syncSecret = process.env.STRIPE_WEBHOOK_SYNC_SECRET;
    if (!stripeSecretKey || !syncSecret) {
      console.error("Stripe checkout environment is not fully configured");
      return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
    }

    const apiEndpoint =
      process.env.API_ENDPOINT ||
      process.env.NEXT_PUBLIC_API_ENDPOINT ||
      "http://localhost:5000/api";

    const summaryResponse = await fetch(
      `${apiEndpoint}/orders/${orderId}/checkout-summary`,
      {
        method: "GET",
        headers: { Authorization: request.headers.get("authorization") || "" },
        cache: "no-store",
      },
    );

    if (!summaryResponse.ok) {
      const status = summaryResponse.status === 404 ? 404 : 400;
      return NextResponse.json(
        { error: "Unable to retrieve this order for checkout" },
        { status },
      );
    }

    const summary = (await summaryResponse.json()) as CheckoutSummary;
    if (
      summary.status !== "pending" ||
      !Array.isArray(summary.items) ||
      summary.items.length === 0 ||
      !Number.isFinite(summary.total) ||
      summary.total <= 0
    ) {
      return NextResponse.json({ error: "This order cannot be checked out" }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = summary.items.map((item) => {
      if (
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price <= 0 ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        throw new Error("Order contains invalid item data");
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const shipping = summary.total > 100 ? 0 : 15;
    const tax = Number((summary.total * 0.08).toFixed(2));

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping", description: "Standard shipping" },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tax" },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    if (!configuredSiteUrl) {
      throw new Error("NEXT_PUBLIC_SITE_URL must be configured");
    }
    const origin = new URL(configuredSiteUrl).origin;
    const encodedOrderId = encodeURIComponent(orderId);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2026-01-28.clover",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/success?orderId=${encodedOrderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel?orderId=${encodedOrderId}`,
      ...(summary.customerEmail ? { customer_email: summary.customerEmail } : {}),
      metadata: { orderId },
      // Keep inventory reservations short; Stripe emits checkout.session.expired
      // when this hosted checkout expires.
      expires_at: Math.floor(Date.now() / 1000) + 45 * 60,
      billing_address_collection: "auto",
    });

    // Persist the exact session before returning its URL. This prevents another
    // checkout session from being attached to the same inventory reservation.
    const attachResponse = await fetch(`${apiEndpoint}/orders/${orderId}/webhook-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": syncSecret,
      },
      body: JSON.stringify({ status: "pending", stripeSessionId: session.id }),
      cache: "no-store",
    });

    if (!attachResponse.ok) {
      // Do not leave an untracked, payable Stripe session behind.
      if (session.status === "open") {
        await stripe.checkout.sessions.expire(session.id);
      }
      const detail = await attachResponse.text();
      throw new Error(`Unable to attach Stripe session to order: ${attachResponse.status} ${detail}`);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
