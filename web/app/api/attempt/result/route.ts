import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Attempt ID topilmadi." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, score, total, percentage, time_used, answers, is_premium, certificate_id, created_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase result error:", error);

      return NextResponse.json(
        { error: "Natija topilmadi." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      attempt: data,
    });
  } catch (error) {
    console.error("Result API error:", error);

    return NextResponse.json(
      { error: "Server xatosi." },
      { status: 500 }
    );
  }
}