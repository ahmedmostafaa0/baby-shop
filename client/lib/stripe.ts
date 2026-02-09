import { CheckoutSessionRequest } from "@/types/types";

export const createCheckoutSession = async (
  data: CheckoutSessionRequest
): Promise<{ url: string } | { error: string }> => {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { url } = await response.json();
    return { url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
