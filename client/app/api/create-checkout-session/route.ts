import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

interface CheckoutItem {
  name: string;
  description?: string;
  amount: number; // amount in cents
  currency: string;
  quantity: number;
  images?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { items, successUrl, cancelUrl, customerEmail, metadata } =
      await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const lineItems = items.map((item: CheckoutItem) => ({
      price_data: {
        currency: item.currency || "usd",
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images || [],
        },
        unit_amount: item.amount,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: metadata || {},
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
