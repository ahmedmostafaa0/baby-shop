import { Order } from "@/types/types";
import { toast } from "sonner";
import api from "./config";

export interface PaymentStatusResult {
  success: boolean;
  order?: Order;
  message?: string;
}

/**
 * Updates payment status for an order after successful Stripe payment
 * This includes both frontend status update and webhook fallback handling
 */
export const handlePaymentSuccess = async (
  orderId: string,
  sessionId: string,
  paymentIntentId?: string
): Promise<PaymentStatusResult> => {
  try {
    console.log("PaymentUtils: Updating order status to paid", {
      orderId,
      sessionId,
    });

    // First, try to update the order status directly
    const {data} = await api.put(`/orders/${orderId}/status`, 
      {status: "paid",
      paymentIntentId,
      sessionId}
    );

    if (data.success && data.order) {
      console.log("PaymentUtils: Order status updated successfully");
      toast.success("Payment confirmed and order updated!");
      return {
        success: true,
        order: data.order,
        message: "Order status updated successfully",
      };
    } else {
      console.warn(
        "PaymentUtils: Failed to update order status:",
        data.message
      );
      // If frontend update fails, the webhook should handle it
      toast.info("Payment successful! Order status will be updated shortly.");
      return {
        success: false,
        message: data.message || "Failed to update order status",
      };
    }
  } catch (error) {
    console.error("PaymentUtils: Error updating order status:", error);
    // Don't show error to user as webhook will handle the update
    toast.info("Payment successful! Order status will be updated shortly.");
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    };
  }
};


export const pollOrderStatus = async (
  orderId: string,
  expectedStatus: string = "paid",
  maxAttempts: number = 6,
  intervalMs: number = 5000
): Promise<PaymentStatusResult> => {
  return new Promise((resolve) => {
    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const {data} = await api.get(`/orders/${orderId}`);

        if (data && data.status === expectedStatus) {
          console.log(
            `PaymentUtils: Order status updated to ${expectedStatus} via polling`
          );
          resolve({
            success: true,
            message: `Order status updated to ${expectedStatus}`,
          });
          return;
        }

        if (attempts >= maxAttempts) {
          console.log("PaymentUtils: Polling timeout reached");
          resolve({
            success: false,
            message: "Timeout waiting for order status update",
          });
          return;
        }

        // Continue polling
        setTimeout(poll, intervalMs);
      } catch (error) {
        console.error("PaymentUtils: Error polling order status:", error);
        resolve({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Error polling order status",
        });
      }
    };

    poll();
  });
};

export const ensurePaymentStatus = async (
  orderId: string,
  sessionId: string,
  paymentIntentId?: string
): Promise<PaymentStatusResult> => {
  // First, try direct update
  const directResult = await handlePaymentSuccess(
    orderId,
    sessionId,
    paymentIntentId
  );

  if (directResult.success) {
    return directResult;
  }

  // If direct update fails, start polling as fallback
  console.log("PaymentUtils: Direct update failed, starting polling fallback");
  const pollResult = await pollOrderStatus(orderId, "paid", 6, 5000);

  if (pollResult.success) {
    toast.success("Payment status updated!");
  }

  return pollResult;
};

/**
 * Check if an order needs payment status update
 */

export const needsPaymentUpdate = (
  order: Order | null | undefined,
  sessionId?: string
): boolean => {
  const needsUpdate: boolean =
    !!order && order.status === "pending" && !!sessionId;
  console.log("PaymentUtils: needsPaymentUpdate check:", {
    hasOrder: !!order,
    orderStatus: order?.status,
    hasSessionId: !!sessionId,
    needsUpdate,
  });
  return needsUpdate;
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (
  status: string
): { text: string; color: string } => {
  switch (status) {
    case "paid":
      return { text: "Paid", color: "text-green-600" };
    case "pending":
      return { text: "Pending", color: "text-yellow-600" };
    case "completed":
      return { text: "Completed", color: "text-blue-600" };
    case "cancelled":
      return { text: "Cancelled", color: "text-red-600" };
    default:
      return { text: status, color: "text-gray-600" };
  }
};