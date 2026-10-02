import { NextResponse } from "next/server";
import crypto from "crypto";
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
        {
          error: "Attempt ID topilmadi.",
        },
        { status: 400 }
      );
    }

    const { data: attempt, error } =
      await supabaseAdmin
        .from("attempts")
        .select(
          "id, score, total, percentage, weighted_score, time_used, answers, is_premium, certificate_id, share_token, created_at"
        )
        .eq("id", id)
        .single();

    if (error || !attempt) {
      console.error(
        "Premium result error:",
        error
      );

      return NextResponse.json(
        {
          error: "Natija topilmadi.",
        },
        { status: 404 }
      );
    }

    // =========================================================
    // PREMIUM ACCESS CHECK
    // =========================================================

    if (!attempt.is_premium) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Premium natija hali ochilmagan.",
          premiumRequired: true,
        },
        { status: 403 }
      );
    }

    // =========================================================
    // CERTIFICATE + SHARE TOKEN
    // =========================================================

    let certificateId =
      attempt.certificate_id;

    let shareToken =
      attempt.share_token;

    if (!certificateId) {
      certificateId =
        `AQL-CERT-${crypto
          .randomBytes(5)
          .toString("hex")
          .toUpperCase()}`;
    }

    if (!shareToken) {
      shareToken =
        crypto
          .randomBytes(16)
          .toString("hex");
    }

    // Agar eski premium attempt bo‘lsa,
    // missing qiymatlarni bazaga saqlaymiz.
    if (
      !attempt.certificate_id ||
      !attempt.share_token
    ) {
      const { error: metaError } =
        await supabaseAdmin
          .from("attempts")
          .update({
            certificate_id:
              certificateId,
            share_token:
              shareToken,
          })
          .eq(
            "id",
            attempt.id
          );

      if (metaError) {
        console.error(
          "Premium metadata update error:",
          metaError
        );

        return NextResponse.json(
          {
            error:
              "Premium ma'lumotlarini saqlashda xatolik.",
          },
          { status: 500 }
        );
      }
    }

    // =========================================================
    // ANSWERS
    // =========================================================

    const answers = Array.isArray(
      attempt.answers
    )
      ? attempt.answers
      : [];

    // =========================================================
    // SECTION RESULTS
    // =========================================================

    const sectionResults =
      sections.map((section) => {
        let score = 0;

        for (
          let i = section.start;
          i <= section.end;
          i++
        ) {
          if (
            answers[i] ===
            answerKey[i]
          ) {
            score++;
          }
        }

        const total =
          section.end -
          section.start +
          1;

        return {
          name: section.name,
          icon: section.icon,
          score,
          total,
          percentage: Math.round(
            (score / total) *
              100
          ),
        };
      });

    // =========================================================
    // STRONGEST SECTION
    // =========================================================

    const strongestSection =
      [...sectionResults].sort(
        (a, b) =>
          b.score - a.score
      )[0];

    // =========================================================
    // SECOND STRONGEST SECTION
    // =========================================================

    const sortedSections =
      [...sectionResults].sort(
        (a, b) =>
          b.score - a.score
      );

    const secondStrongestSection =
      sortedSections.length > 1
        ? sortedSections[1]
        : null;

    // =========================================================
    // SHARE URL
    // =========================================================

    const shareUrl =
      `https://aqltest.vercel.app/share/${shareToken}`;

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json({
      success: true,

      attempt: {
        id: attempt.id,
        score: attempt.score,
        total: attempt.total,
        percentage:
          attempt.percentage,
        weightedScore:
          attempt.weighted_score,
        timeUsed:
          attempt.time_used,
        answers,
        certificateId,
        shareToken,
        shareUrl,
      },

      sections:
        sectionResults,

      strongestSection,

      secondStrongestSection,
    });
  } catch (error) {
    console.error(
      "Premium API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Server xatosi.",
      },
      { status: 500 }
    );
  }
}