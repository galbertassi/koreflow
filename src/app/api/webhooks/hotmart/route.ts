import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { processHotmartWebhook } from "@/lib/billing/hotmart-service";
import { HotmartWebhookPayload } from "@/lib/billing/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://urybvljsmrwxmfjcgdvt.supabase.co";
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeWJ2bGpzbXJ3eG1mamNnZHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIyMTY0NCwiZXhwIjoyMDk2Nzk3NjQ0fQ.WPRAuBLsvuyAuGWIsAhk82U9Bj1Yu9upBpOLgq3hwQE";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const headersList = await headers();
    const headerHottok =
      headersList.get("x-hotmart-hottok") ||
      headersList.get("X-HOTMART-HOTTOK") ||
      headersList.get("hottok");

    let payload: HotmartWebhookPayload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const receivedHottok = headerHottok || payload.hottok || null;

    const result = await processHotmartWebhook(
      payload,
      receivedHottok,
      supabaseAdmin
    );

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        eventId: result.eventId,
        alreadyProcessed: result.alreadyProcessed,
      },
      { status: result.statusCode }
    );
  } catch (error: any) {
    console.error("[HOTMART_WEBHOOK_ROUTE_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
