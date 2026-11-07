import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";

/**
 * Releases reservations for orders that never reached Stripe Checkout.
 * The conditional status transition and stock increments share one transaction,
 * so concurrent API instances cannot restore the same reservation twice.
 */
export async function releaseExpiredUnstartedReservations(): Promise<void> {
  for (;;) {
    const session = await mongoose.startSession();
    let released = false;
    try {
      await session.withTransaction(async () => {
        released = false;
        const order = await Order.findOneAndUpdate(
          {
            status: "pending",
            reservationExpiresAt: { $lte: new Date() },
            $or: [
              { stripeSessionId: { $exists: false } },
              { stripeSessionId: null },
            ],
          },
          { $set: { status: "cancelled", updatedAt: new Date() } },
          { new: true, session },
        );

        if (!order) return;
        released = true;

        for (const item of order.items) {
          const result = await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } },
            { session },
          );
          if (result.matchedCount !== 1) {
            throw new Error(`Cannot restore inventory for product ${item.productId}`);
          }
        }
      });
    } finally {
      await session.endSession();
    }

    if (!released) return;
  }
}

/** Start a lightweight cleanup loop after MongoDB has connected. */
export function startReservationCleanup(): NodeJS.Timeout {
  const run = () => {
    void releaseExpiredUnstartedReservations().catch((error: unknown) => {
      console.error("Failed to clean up expired inventory reservations:", error);
    });
  };

  run();
  const timer = setInterval(run, 60_000);
  timer.unref();
  return timer;
}
