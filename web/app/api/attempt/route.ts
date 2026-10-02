import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/app/lib/supabase";
import { answerKey } from "./answer-key";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
        { error: "Noto‘g‘ri ma'lumot yuborildi." },
        { status: 400 }
      );
    }

    let telegramUserId: number | null = null;

    if (telegramInitData) {
      const telegramUser = validateTelegramInitData(
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

      telegramUserId = telegramUser.id;
    }

    let score = 0;

    for (let i = 0; i < answerKey.length; i++) {
      if (answers[i] === answerKey[i]) {
        score++;
      }
    }

    const total = answerKey.length;
    const percentage = Math.round(
      (score / total) * 100
    );

    const attemptId = crypto.randomUUID();

    const { error } = await supabase
      .from("attempts")
      .insert({
        id: attemptId,
        score,
        total,
        percentage,
        time_used: timeUsed,
        answers,
        telegram_user_id: telegramUserId,
      });

    if (error) {
      console.error("Supabase error:", error);

      return NextResponse.json(
        {
          error:
            "Natijani saqlashda xatolik.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attemptId,
      score,
      total,
      percentage,
      telegramUserId,
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Server xatosi." },
      { status: 500 }
    );
  }
}