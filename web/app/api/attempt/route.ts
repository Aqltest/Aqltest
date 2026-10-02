import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/app/lib/supabase";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { answerKey } from "./answer-key";

function validateTelegramInitData(initData: string) {
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN topilmadi."
    );
  }

  const params = new URLSearchParams(
    initData
  );

  const receivedHash =
    params.get("hash");

  if (!receivedHash) {
    return null;
  }

  params.delete("hash");

  const dataCheckString =
    Array.from(params.entries())
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(
        ([key, value]) =>
          `${key}=${value}`
      )
      .join("\n");

  const secretKey =
    crypto
      .createHmac(
        "sha256",
        "WebAppData"
      )
      .update(botToken)
      .digest();

  const calculatedHash =
    crypto
      .createHmac(
        "sha256",
        secretKey
      )
      .update(dataCheckString)
      .digest("hex");

  if (
    calculatedHash !==
    receivedHash
  ) {
    return null;
  }

  const userString =
    params.get("user");

  if (!userString) {
    return null;
  }

  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      answers,
      timeUsed,
      telegramInitData,
    } = body;

    if (
      !Array.isArray(answers) ||
      typeof timeUsed !== "number"
    ) {
      return NextResponse.json(
        {
          error:
            "Noto‘g‘ri ma'lumot yuborildi.",
        },
        { status: 400 }
      );
    }

    let telegramUserId:
      number | null = null;

    let telegramFirstName = "";
    let telegramLastName = "";

    // =========================================================
    // TELEGRAM AUTH
    // =========================================================

    if (telegramInitData) {
      const telegramUser =
        validateTelegramInitData(
          telegramInitData
        );

      if (!telegramUser) {
        return NextResponse.json(
          {
            error:
              "Telegram ma'lumotlari tasdiqlanmadi.",
          },
          { status: 401 }
        );
      }

      telegramUserId =
        Number(
          telegramUser.id
        );

      telegramFirstName =
        telegramUser.first_name ??
        "";

      telegramLastName =
        telegramUser.last_name ??
        "";
    }

    // =========================================================
    // GET USER-SELECTED NAME
    // =========================================================

    let displayName:
      string | null = null;

    if (telegramUserId !== null) {
      const {
        data: telegramProfile,
        error: profileError,
      } = await supabaseAdmin
        .from("telegram_users")
        .select(
          "display_name"
        )
        .eq(
          "telegram_user_id",
          telegramUserId
        )
        .maybeSingle();

      if (profileError) {
        console.error(
          "Telegram profile error:",
          profileError
        );
      }

      if (
        telegramProfile?.display_name
      ) {
        displayName =
          telegramProfile.display_name
            .trim();
      }

      // Fallback
      if (!displayName) {
        displayName = [
          telegramFirstName,
          telegramLastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
      }
    }

    // =========================================================
    // WEIGHTED SCORING
    // TOTAL = 100
    // =========================================================

    const questionWeights = [
      2, 2, 3, 3,
      3, 3, 4, 4,
      3, 3, 4, 4,
      6, 4, 5, 5,
      4, 5, 5, 6,
      5, 5, 6, 6,
    ];

    let score = 0;
    let weightedScore = 0;

    for (
      let i = 0;
      i < answerKey.length;
      i++
    ) {
      if (
        answers[i] ===
        answerKey[i]
      ) {
        score++;

        weightedScore +=
          questionWeights[i];
      }
    }

    const total =
      answerKey.length;

    // AqlTest Score = 0–100
    const percentage =
      weightedScore;

    // =========================================================
    // ATTEMPT ID
    // =========================================================

    const attemptId =
      crypto.randomUUID();

    // =========================================================
    // PREMIUM CODE
    // =========================================================

    const premiumCode =
      `AQL-${crypto
        .randomBytes(5)
        .toString("hex")
        .toUpperCase()}`;

    // =========================================================
    // SAVE ATTEMPT
    // =========================================================

    const { error } =
      await supabase
        .from("attempts")
        .insert({
          id: attemptId,
          score,
          total,
          percentage,
          weighted_score:
            weightedScore,
          time_used: timeUsed,
          answers,
          telegram_user_id:
            telegramUserId,
          display_name:
            displayName,
          premium_code:
            premiumCode,
        });

    if (error) {
      console.error(
        "Supabase error:",
        error
      );

      if (
        error.code === "23505" &&
        telegramUserId !== null
      ) {
        return NextResponse.json(
          {
            error:
              "Siz bepul testni allaqachon ishlab bo‘lgansiz.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Natijani saqlashda xatolik.",
        },
        { status: 500 }
      );
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json({
      success: true,
      attemptId,
      premiumCode,
      score,
      total,
      percentage,
      weightedScore,
      telegramUserId,
      displayName,
    });
  } catch (error) {
    console.error(
      "API error:",
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