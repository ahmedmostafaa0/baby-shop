import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose, { Types } from "mongoose";
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
    total: 10,
    shippingAddress: {
      street: "Test street",
      city: "Test city",
      country: "Test country",
      postalCode: "12345",
    },
    status: "pending" as const,
  };

  const [expiredOrder, activeOrder] = await Order.create([
    { ...common, reservationExpiresAt: new Date(Date.now() - 60_000) },
    { ...common, reservationExpiresAt: new Date(Date.now() + 60_000) },
  ]);

  // Simulate two API instances running the cleanup worker simultaneously.
  await Promise.all([
    releaseExpiredUnstartedReservations(),
    releaseExpiredUnstartedReservations(),
  ]);

  const refreshedProduct = await Product.findById(product._id);
  const refreshedExpiredOrder = await Order.findById(expiredOrder._id);
  const refreshedActiveOrder = await Order.findById(activeOrder._id);

  assert.equal(refreshedProduct?.stock, 1);
  assert.equal(refreshedExpiredOrder?.status, "cancelled");
  assert.equal(refreshedActiveOrder?.status, "pending");
});
