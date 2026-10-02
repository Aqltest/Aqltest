import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { answerKey } from "../answer-key";

const sections = [
  {
    name: "Sonli mantiq",
    start: 0,
    end: 3,
    icon: "🧮",
  },
  {
    name: "Vizual mantiq",
    start: 4,
    end: 7,
    icon: "🧩",
  },
  {
    name: "Analogiya",
    start: 8,
    end: 11,
    icon: "🔗",
  },
  {
    name: "Mantiqiy xulosa",
    start: 12,
    end: 15,
    icon: "🧠",
  },
  {
    name: "Murakkab ketma-ketlik",
    start: 16,
    end: 19,
    icon: "📊",
  },
  {
    name: "Advanced vizual",
    start: 20,
    end: 23,
    icon: "🔷",
  },
];

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

    const { data: attempt, error } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, score, total, percentage, time_used, answers, is_premium, certificate_id, created_at"
      )
      .eq("id", id)
      .single();

    if (error || !attempt) {
      console.error("Premium result error:", error);

      return NextResponse.json(
        { error: "Natija topilmadi." },
        { status: 404 }
      );
    }

    // =========================
    // PREMIUM ACCESS CHECK
    // =========================

    if (!attempt.is_premium) {
      return NextResponse.json(
        {
          success: false,
          error: "Premium natija hali ochilmagan.",
          premiumRequired: true,
        },
        { status: 403 }
      );
    }

    // =========================
    // ANSWERS
    // =========================

    const answers = Array.isArray(attempt.answers)
      ? attempt.answers
      : [];

    // =========================
    // SECTION RESULTS
    // =========================

    const sectionResults = sections.map((section) => {
      let score = 0;

      for (
        let i = section.start;
        i <= section.end;
        i++
      ) {
        if (answers[i] === answerKey[i]) {
          score++;
        }
      }

      return {
        name: section.name,
        icon: section.icon,
        score,
        total:
          section.end - section.start + 1,
        percentage: Math.round(
          (score /
            (section.end - section.start + 1)) *
            100
        ),
      };
    });

    // =========================
    // STRONGEST SECTION
    // =========================

    const strongestSection = [...sectionResults].sort(
      (a, b) => b.score - a.score
    )[0];

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      attempt: {
        id: attempt.id,
        score: attempt.score,
        total: attempt.total,
        percentage: attempt.percentage,
        timeUsed: attempt.time_used,
        answers,
      },

      sections: sectionResults,

      strongestSection,
    });
  } catch (error) {
    console.error(
      "Premium API error:",
      error
    );

    return NextResponse.json(
      { error: "Server xatosi." },
      { status: 500 }
    );
  }
}