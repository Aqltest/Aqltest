import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { answerKey } from "./answer-key";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { answers, timeUsed } = body;

    if (!Array.isArray(answers) || typeof timeUsed !== "number") {
      return NextResponse.json(
        { error: "Noto‘g‘ri ma'lumot yuborildi." },
        { status: 400 }
      );
    }

    // =========================
    // SERVER-SIDE SCORING
    // =========================

    let score = 0;

    for (let i = 0; i < answerKey.length; i++) {
      if (answers[i] === answerKey[i]) {
        score++;
      }
    }

    const total = answerKey.length;
    const percentage = Math.round((score / total) * 100);

    // =========================
    // ATTEMPT ID
    // =========================

    const attemptId = crypto.randomUUID();

    // =========================
    // SUPABASE
    // =========================

    const { error } = await supabase
      .from("attempts")
      .insert({
        id: attemptId,
        score,
        total,
        percentage,
        time_used: timeUsed,
        answers,
      });

    if (error) {
      console.error("Supabase error:", error);

      return NextResponse.json(
        { error: "Natijani saqlashda xatolik." },
        { status: 500 }
      );
    }

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json({
      success: true,
      attemptId,
      score,
      total,
      percentage,
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Server xatosi." },
      { status: 500 }
    );
  }
}