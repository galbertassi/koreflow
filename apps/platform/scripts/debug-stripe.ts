import { Stripe } from "stripe";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" as any });

async function run() {
  // Get latest subscription
  const subs = await stripe.subscriptions.list({ limit: 1 });
  if (subs.data.length > 0) {
    const sub = subs.data[0] as any;
    console.log("Subscription:");
    console.log("current_period_start:", sub.current_period_start);
    console.log("current_period_end:", sub.current_period_end);
    console.log("Keys:", Object.keys(sub));
  } else {
    console.log("No subscriptions found.");
  }
}

run();
