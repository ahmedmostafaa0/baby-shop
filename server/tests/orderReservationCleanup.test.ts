import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose, { Types } from "mongoose";
import express from "express";
import orderRoutes from "../routes/order";
import { createOrderFromCart } from "../controllers/order";
import Order from "../models/Order";
import Product from "../models/Product";
import { releaseExpiredUnstartedReservations } from "../utils/orderReservationCleanup";

const mongoUri = process.env.MONGO_URI;

before(async () => {
  if (!mongoUri) throw new Error("MONGO_URI is required for inventory integration tests");
  await mongoose.connect(mongoUri);
  await Order.deleteMany({});
  await Product.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
});

test("concurrent orders and duplicate cart rows cannot oversell inventory", async () => {
  const userId = new Types.ObjectId();
  const shippingAddress = {
    street: "Test street",
    city: "Test city",
    country: "Test country",
    postalCode: "12345",
  };
  const invokeCreateOrder = (items: Array<{ _id: string; quantity: number }>) =>
    new Promise<{ status: number; body?: unknown; error?: unknown }>((resolve) => {
      const response = {
        statusCode: 201,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(body: unknown) {
          resolve({ status: this.statusCode, body });
          return this;
        },
      };
      const request = {
        body: { items, shippingAddress },
        user: { _id: userId, role: "user" },
      };
      const next = (error: unknown) => resolve({ status: response.statusCode, error });
      (createOrderFromCart as unknown as (
        req: unknown,
        res: unknown,
        next: (error: unknown) => void,
      ) => void)(request, response, next);
    });

  const concurrentProduct = await Product.create({
    name: `Concurrent stock test ${new Types.ObjectId().toString()}`,
    description: "Concurrent inventory reservation test",
    price: 20,
    stock: 1,
    image: ["https://example.com/product.png"],
    category: new Types.ObjectId(),
    brand: new Types.ObjectId(),
  });

  const concurrentResults = await Promise.all([
    invokeCreateOrder([{ _id: concurrentProduct._id.toString(), quantity: 1 }]),
    invokeCreateOrder([{ _id: concurrentProduct._id.toString(), quantity: 1 }]),
  ]);
  assert.deepEqual(concurrentResults.map((result) => result.status).sort(), [201, 409]);
  assert.equal((await Product.findById(concurrentProduct._id))?.stock, 0);
  assert.equal(await Order.countDocuments({ "items.productId": concurrentProduct._id }), 1);
  const createdOrder = await Order.findOne({ "items.productId": concurrentProduct._id });
  assert.equal(createdOrder?.subtotal, 20);
  assert.equal(createdOrder?.shippingCost, 15);
  assert.equal(createdOrder?.tax, 1.6);
  assert.equal(createdOrder?.total, 36.6);

  const duplicateProduct = await Product.create({
    name: `Duplicate row test ${new Types.ObjectId().toString()}`,
    description: "Duplicate cart row stock validation test",
    price: 20,
    stock: 1,
    image: ["https://example.com/product.png"],
    category: new Types.ObjectId(),
    brand: new Types.ObjectId(),
  });

  const duplicateResult = await invokeCreateOrder([
    { _id: duplicateProduct._id.toString(), quantity: 1 },
    { _id: duplicateProduct._id.toString().toUpperCase(), quantity: 1 },
  ]);
  assert.equal(duplicateResult.status, 409);
  assert.equal((await Product.findById(duplicateProduct._id))?.stock, 1);
  assert.equal(await Order.countDocuments({ "items.productId": duplicateProduct._id }), 0);
});

test("expired unstarted reservations restore stock exactly once", async () => {
  const product = await Product.create({
    name: `Reservation test ${new Types.ObjectId().toString()}`,
    description: "Inventory reservation integration test",
    price: 10,
    stock: 0,
    image: ["https://example.com/product.png"],
    category: new Types.ObjectId(),
    brand: new Types.ObjectId(),
  });

  const userId = new Types.ObjectId();
  const common = {
    userId,
    items: [{
      productId: product._id,
      name: product.name,
      price: 10,
      quantity: 1,
      image: "https://example.com/product.png",
    }],
    subtotal: 10,
    shippingCost: 15,
    tax: 0.8,
    total: 25.8,
    shippingAddress: {
      street: "Test street",
      city: "Test city",
      country: "Test country",
      postalCode: "12345",
    },
    status: "pending" as const,
  };

  const expiredOrder = await Order.create({
    ...common,
    reservationExpiresAt: new Date(Date.now() - 60_000),
  });
  const activeOrder = await Order.create({
    ...common,
    reservationExpiresAt: new Date(Date.now() + 60_000),
  });
  const legacyOrder = await Order.create(common);

  // Simulate two API instances running the cleanup worker simultaneously.
  await Promise.all([
    releaseExpiredUnstartedReservations(),
    releaseExpiredUnstartedReservations(),
  ]);

  const refreshedProduct = await Product.findById(product._id);
  const refreshedExpiredOrder = await Order.findById(expiredOrder._id);
  const refreshedActiveOrder = await Order.findById(activeOrder._id);
  const refreshedLegacyOrder = await Order.findById(legacyOrder._id);

  assert.equal(refreshedProduct?.stock, 1);
  assert.equal(refreshedExpiredOrder?.status, "cancelled");
  assert.equal(refreshedActiveOrder?.status, "pending");
  assert.equal(refreshedLegacyOrder?.status, "cancelled");
});

test("expired Stripe webhook restores stock once and is idempotent", async () => {
  const product = await Product.create({
    name: `Stripe expiry test ${new Types.ObjectId().toString()}`,
    description: "Stripe webhook inventory integration test",
    price: 12,
    stock: 0,
    image: ["https://example.com/product.png"],
    category: new Types.ObjectId(),
    brand: new Types.ObjectId(),
  });
  const order = await Order.create({
    userId: new Types.ObjectId(),
    items: [{
      productId: product._id,
      name: product.name,
      price: 12,
      quantity: 1,
      image: "https://example.com/product.png",
    }],
    subtotal: 12,
    shippingCost: 15,
    tax: 0.96,
    total: 27.96,
    status: "pending",
    stripeSessionId: "cs_test_expired",
    shippingAddress: {
      street: "Test street",
      city: "Test city",
      country: "Test country",
      postalCode: "12345",
    },
  });

  process.env.STRIPE_WEBHOOK_SYNC_SECRET = "integration-test-secret";
  const app = express();
  app.use(express.json());
  app.use("/api/orders", orderRoutes);
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));

  try {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind a TCP port");
    const endpoint = `http://127.0.0.1:${address.port}/api/orders/${order._id}/webhook-status`;
    const payload = JSON.stringify({ status: "cancelled", stripeSessionId: "cs_test_expired" });
    const sendExpiredEvent = () => fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": "integration-test-secret",
      },
      body: payload,
    });

    const firstResponse = await sendExpiredEvent();
    assert.equal(firstResponse.status, 200);
    const secondResponse = await sendExpiredEvent();
    assert.equal(secondResponse.status, 200);

    const refreshedProduct = await Product.findById(product._id);
    const refreshedOrder = await Order.findById(order._id);
    assert.equal(refreshedProduct?.stock, 1);
    assert.equal(refreshedOrder?.status, "cancelled");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("paid Stripe webhook marks an order paid without restoring reserved stock twice", async () => {
  const product = await Product.create({
    name: `Stripe paid test ${new Types.ObjectId().toString()}`,
    description: "Stripe paid webhook integration test",
    price: 15,
    stock: 0,
    image: ["https://example.com/product.png"],
    category: new Types.ObjectId(),
    brand: new Types.ObjectId(),
  });
  const order = await Order.create({
    userId: new Types.ObjectId(),
    items: [{
      productId: product._id,
      name: product.name,
      price: 15,
      quantity: 1,
      image: "https://example.com/product.png",
    }],
    subtotal: 15,
    shippingCost: 15,
    tax: 1.2,
    total: 31.2,
    status: "pending",
    stripeSessionId: "cs_test_paid",
    shippingAddress: {
      street: "Test street",
      city: "Test city",
      country: "Test country",
      postalCode: "12345",
    },
  });

  process.env.STRIPE_WEBHOOK_SYNC_SECRET = "integration-test-secret";
  const app = express();
  app.use(express.json());
  app.use("/api/orders", orderRoutes);
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));

  try {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind a TCP port");
    const endpoint = `http://127.0.0.1:${address.port}/api/orders/${order._id}/webhook-status`;
    const payload = JSON.stringify({
      status: "paid",
      stripeSessionId: "cs_test_paid",
      paymentIntentId: "pi_test_paid",
    });
    const sendPaidEvent = () => fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": "integration-test-secret",
      },
      body: payload,
    });

    const firstResponse = await sendPaidEvent();
    assert.equal(firstResponse.status, 200);
    const duplicateResponse = await sendPaidEvent();
    assert.equal(duplicateResponse.status, 200);

    const refreshedProduct = await Product.findById(product._id);
    const refreshedOrder = await Order.findById(order._id);
    assert.equal(refreshedProduct?.stock, 0);
    assert.equal(refreshedOrder?.status, "paid");
    assert.equal(refreshedOrder?.paymentIntentId, "pi_test_paid");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});
