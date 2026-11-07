import assert from "node:assert/strict";
import { test } from "node:test";
import Stripe from "stripe";
import { NextRequest } from "next/server.js";
import { POST } from "../app/api/stripe-webhook/route.ts";

const stripe = new Stripe("sk_test_webhook_suite");
const webhookSecret = "whsec_test_webhook_suite";
const orderId = "507f1f77bcf86cd799439011";

function signedEvent(type: string, sessionOverrides: Record<string, unknown> = {}) {
  const payload = JSON.stringify({
    id: `evt_${type.replaceAll(".", "_")}`,
    object: "event",
    api_version: "2026-01-28.clover",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "cs_test_checkout",
        object: "checkout.session",
        metadata: { orderId },
        payment_status: type === "checkout.session.completed" ? "paid" : "unpaid",
        payment_intent: null,
        ...sessionOverrides,
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type,
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
  return { payload, signature };
}

test("valid expired checkout webhook syncs cancellation for its order", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_webhook_suite";
  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
  process.env.STRIPE_WEBHOOK_SYNC_SECRET = "backend-sync-test-secret";

  const originalFetch = globalThis.fetch;
  let synced: Record<string, unknown> | undefined;
  let syncedUrl = "";
  globalThis.fetch = async (input, init) => {
    syncedUrl = String(input);
    synced = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };

  try {
    const { payload, signature } = signedEvent("checkout.session.expired");
    const request = new NextRequest("http://localhost/api/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": signature },
      body: payload,
    });
    const response = await POST(request);
    assert.equal(response.status, 200);
    assert.equal(synced?.status, "cancelled");
    assert.equal(synced?.stripeSessionId, "cs_test_checkout");
    assert.ok(syncedUrl.endsWith(`/orders/${orderId}/webhook-status`));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("invalid Stripe signatures are rejected before backend synchronization", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_webhook_suite";
  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("unexpected", { status: 200 });
  };

  try {
    const { payload } = signedEvent("checkout.session.expired");
    const request = new NextRequest("http://localhost/api/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=invalid" },
      body: payload,
    });
    const response = await POST(request);
    assert.equal(response.status, 400);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("paid checkout events synchronize the paid status and payment intent", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_webhook_suite";
  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
  process.env.STRIPE_WEBHOOK_SYNC_SECRET = "backend-sync-test-secret";

  const originalFetch = globalThis.fetch;
  let synced: Record<string, unknown> | undefined;
  globalThis.fetch = async (_input, init) => {
    synced = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };

  try {
    const { payload, signature } = signedEvent("checkout.session.completed", {
      payment_status: "paid",
      payment_intent: "pi_test_payment",
    });
    const request = new NextRequest("http://localhost/api/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": signature },
      body: payload,
    });
    const response = await POST(request);
    assert.equal(response.status, 200);
    assert.equal(synced?.status, "paid");
    assert.equal(synced?.paymentIntentId, "pi_test_payment");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("completed checkout events without paid status are ignored", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_webhook_suite";
  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("unexpected", { status: 200 });
  };

  try {
    const { payload, signature } = signedEvent("checkout.session.completed", {
      payment_status: "unpaid",
    });
    const request = new NextRequest("http://localhost/api/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": signature },
      body: payload,
    });
    const response = await POST(request);
    assert.equal(response.status, 200);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
