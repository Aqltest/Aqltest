import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

function validateTelegramInitData(initData: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN topilmadi.");
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");

  if (!receivedHash) {
    return null;
  }

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== receivedHash) {
    return null;
  }

  const userString = params.get("user");

  if (!userString) {
    return null;
  }

  return JSON.parse(userString);
}

async function getRanking() {
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
    throw new Error("Reytingni olishda xatolik.");
  }

  const bestByUser = new Map<
    number,
    {
      telegramUserId: number;
      displayName: string;
      score: number;
    }
  >();

  for (const attempt of attempts ?? []) {
    const userId = Number(attempt.telegram_user_id);

    if (bestByUser.has(userId)) {
      continue;
    }

    bestByUser.set(userId, {
      telegramUserId: userId,
      displayName:
        attempt.display_name?.trim() ||
        "AqlTest foydalanuvchisi",
      score: Number(attempt.weighted_score),
    });
  }

  const allUsers = Array.from(bestByUser.values()).sort(
    (a, b) => b.score - a.score
  );

  const ranking = allUsers
    .slice(0, 100)
    .map((user, index) => ({
      rank: index + 1,
      displayName: user.displayName,
      score: user.score,
    }));

  return {
    allUsers,
    ranking,
  };
}

// =========================
// GET — umumiy reyting
// =========================

export async function GET() {
  try {
    const { ranking } = await getRanking();

    return NextResponse.json({
      success: true,
      totalUsers: ranking.length,
      ranking,
    });
  } catch (error) {
    console.error("Ranking API error:", error);

    return NextResponse.json(
      {
        error: "Serverda xatolik.",
      },
      { status: 500 }
    );
  }
}

// =========================
// POST — foydalanuvchi bilan reyting
// =========================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const initData = body?.initData;

    let telegramUserId: number | null = null;

    if (typeof initData === "string" && initData) {
      const telegramUser =
        validateTelegramInitData(initData);

      if (!telegramUser) {
        return NextResponse.json(
          {
            error:
              "Telegram ma'lumotlari tasdiqlanmadi.",
          },
          { status: 401 }
        );
      }

      telegramUserId = Number(telegramUser.id);
    }

    const { allUsers, ranking } = await getRanking();

    let myRank: number | null = null;
    let myScore: number | null = null;
    let myDisplayName: string | null = null;

    if (telegramUserId !== null) {
      const myIndex = allUsers.findIndex(
        (user) =>
          user.telegramUserId === telegramUserId
      );

      if (myIndex !== -1) {
        myRank = myIndex + 1;
        myScore = allUsers[myIndex].score;
        myDisplayName =
          allUsers[myIndex].displayName;
      }
    }

    return NextResponse.json({
      success: true,
      totalUsers: allUsers.length,
      ranking,
      myRank,
      myScore,
      myDisplayName,
    });
  } catch (error) {
    console.error("Ranking API error:", error);

    return NextResponse.json(
      {
        error: "Serverda xatolik.",
      },
      { status: 500 }
    );
  }
}