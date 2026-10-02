import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: attempts, error } = await supabaseAdmin
      .from("attempts")
      .select(
        "telegram_user_id, display_name, weighted_score, created_at"
      )
      .eq("is_premium", true)
      .not("telegram_user_id", "is", null)
      .not("weighted_score", "is", null)
      .order("weighted_score", {
        ascending: false,
      })
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Ranking query error:", error);

      return NextResponse.json(
        {
          error: "Reytingni olishda xatolik.",
        },
        { status: 500 }
      );
    }

    // Har bir Telegram foydalanuvchisidan
    // faqat eng yaxshi natijani olamiz.
    const bestByUser = new Map<
      number,
      {
        telegramUserId: number;
        displayName: string;
        score: number;
      }
    >();

    for (const attempt of attempts ?? []) {
      const userId = Number(
        attempt.telegram_user_id
      );

      if (bestByUser.has(userId)) {
        continue;
      }

      bestByUser.set(userId, {
        telegramUserId: userId,
        displayName:
          attempt.display_name?.trim() ||
          "AqlTest foydalanuvchisi",
        score: attempt.weighted_score,
      });
    }

    const ranking = Array.from(
      bestByUser.values()
    )
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .map((user, index) => ({
        rank: index + 1,
        displayName: user.displayName,
        score: user.score,
      }));

    return NextResponse.json({
      success: true,
      totalUsers: ranking.length,
      ranking,
    });
  } catch (error) {
    console.error(
      "Ranking API error:",
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