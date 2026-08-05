import Stripe from "stripe";
import { billingConfig } from "@/lib/billing/config";

// We only initialize the real Stripe client if billing is enabled
// AND we are on the server side.
export const stripe =
  typeof window === "undefined" && billingConfig.enabled && process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-06-24.dahlia", // Use the latest typed version
        typescript: true,
      })
    : (null as unknown as Stripe);
