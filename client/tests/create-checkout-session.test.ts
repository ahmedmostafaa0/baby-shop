import assert from "node:assert/strict";
import { test } from "node:test";
import type Stripe from "stripe";
import { NextRequest } from "next/server.js";
import { createCheckoutSession } from "../app/api/create-checkout-session/route.ts";

const orderId = "507f1f77bcf86cd799439011";
const validSummary = {
  orderId,
  status: "pending" as const,
  subtotal: 60,
  shippingCost: 15,
  tax: 4.8,
  total: 79.8,
  customerEmail: "customer@example.com",
  items: [{ name: "Baby blanket", price: 30, quantity: 2 }],
};

function request() {
  return new NextRequest("http://localhost/api/create-checkout-session", {
    method: "POST",
    headers: { authorization: "Bearer test-user-token" },
    body: JSON.stringify({ orderId }),
  });
}

function setCheckoutEnvironment() {
  process.env.STRIPE_SECRET_KEY = "sk_test_checkout_suite";
  process.env.STRIPE_WEBHOOK_SYNC_SECRET = "backend-sync-test-secret";
  process.env.API_ENDPOINT = "http://api.test/api";
  process.env.NEXT_PUBLIC_SITE_URL = "https://shop.example.com";
}

function mockStripe() {
  let createParams: Stripe.Checkout.SessionCreateParams | undefined;
  const expired: string[] = [];
  const stripe = {
    checkout: {
      sessions: {
        create: async (params: Stripe.Checkout.SessionCreateParams) => {
          createParams = params;
          return { id: "cs_test_checkout", url: "https://checkout.stripe.test/session", status: "open" };
        },
        expire: async (id: string) => {
          expired.push(id);
          return { id, status: "expired" };
        },
      },
    },
  } as unknown as Stripe;
  return { stripe, getCreateParams: () => createParams, expired };
}

test("creates Stripe checkout from trusted backend totals and attaches the session to the order", async () => {
  setCheckoutEnvironment();
  const mock = mockStripe();
  const requests: Array<{ url: string; method: string; body?: Record<string, unknown>; headers?: Headers }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : undefined;
    requests.push({ url, method, body, headers: new Headers(init?.headers) });
    if (method === "GET") return Response.json(validSummary);
    return Response.json({ success: true });
  };

  const response = await createCheckoutSession(request(), {
    fetcher,
    createStripe: () => mock.stripe,
  });
  const payload = await response.json();
  const params = mock.getCreateParams();

  assert.equal(response.status, 200);
  assert.equal(payload.url, "https://checkout.stripe.test/session");
  assert.equal(params?.mode, "payment");
  assert.equal(params?.metadata?.orderId, orderId);
  assert.equal(params?.line_items?.length, 3);
  assert.equal(params?.line_items?.[0]?.price_data?.unit_amount, 3000);
  assert.equal(params?.line_items?.[1]?.price_data?.unit_amount, 1500);
  assert.equal(params?.line_items?.[2]?.price_data?.unit_amount, 480);
  assert.equal(params?.customer_email, "customer@example.com");
  assert.equal(requests[0]?.headers?.get("authorization"), "Bearer test-user-token");
  assert.equal(requests[1]?.url, `http://api.test/api/orders/${orderId}/webhook-status`);
  assert.equal(requests[1]?.body?.stripeSessionId, "cs_test_checkout");
  assert.equal(requests[1]?.body?.status, "pending");
  assert.equal(mock.expired.length, 0);
});

test("expires an untracked Stripe session if the backend rejects session attachment", async () => {
  setCheckoutEnvironment();
  const mock = mockStripe();
  const fetcher: typeof fetch = async (_input, init) => {
    if ((init?.method ?? "GET") === "GET") return Response.json(validSummary);
    return new Response("order already has a different checkout session", { status: 409 });
  };

  const response = await createCheckoutSession(request(), {
    fetcher,
    createStripe: () => mock.stripe,
  });

  assert.equal(response.status, 500);
  assert.deepEqual(mock.expired, ["cs_test_checkout"]);
});

test("rejects a backend total that does not reconcile with checkout line items", async () => {
  setCheckoutEnvironment();
  const mock = mockStripe();
  let stripeCreated = false;
  const fetcher: typeof fetch = async () => Response.json({ ...validSummary, total: 80 });
  const response = await createCheckoutSession(request(), {
    fetcher,
    createStripe: () => {
      stripeCreated = true;
      return mock.stripe;
    },
  });

  assert.equal(response.status, 500);
  assert.equal(stripeCreated, false);
});
