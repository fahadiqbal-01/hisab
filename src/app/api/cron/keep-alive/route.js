import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const { error } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      console.error("Supabase keep-alive ping failed:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Supabase keep-alive ping succeeded", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (err) {
    console.error("Supabase keep-alive ping exception:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
