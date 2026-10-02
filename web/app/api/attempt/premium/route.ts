import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { answerKey } from "@/app/api/attempt/answer-key";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

const sectionRanges = [
  {
    name: "Sonli mantiq",
    start: 0,
    end: 3,
  },
  {
    name: "Vizual mantiq",
    start: 4,
    end: 7,
  },
  {
    name: "Analogiya",
    start: 8,
    end: 11,
  },
  {
    name: "Mantiqiy xulosa",
    start: 12,
    end: 15,
  },
  {
    name: "Murakkab ketma-ketlik",
    start: 16,
    end: 19,
  },
  {
    name: "Advanced vizual",
    start: 20,
    end: 23,
  },
];

const sectionIcons: Record<string, string> = {
  "Sonli mantiq": "🧮",
  "Vizual mantiq": "🧩",
  Analogiya: "🔗",
  "Mantiqiy xulosa": "🧠",
  "Murakkab ketma-ketlik": "📊",
  "Advanced vizual": "🔷",
};

const sectionDescriptions: Record<string, string> = {
  "Sonli mantiq":
    "Sonlar, hisoblash va raqamlar orasidagi mantiqiy bog‘lanishlarni aniqlash qobiliyati.",
  "Vizual mantiq":
    "Shakllar, tasvirlar va fazoviy o‘zgarishlar orasidagi bog‘lanishlarni ko‘rish qobiliyati.",
  Analogiya:
    "Tushunchalar va obyektlar o‘rtasidagi o‘xshashlik hamda munosabatlarni aniqlash qobiliyati.",
  "Mantiqiy xulosa":
    "Berilgan ma’lumotlardan mantiqiy xulosa chiqarish va shartlarni to‘g‘ri tahlil qilish qobiliyati.",
  "Murakkab ketma-ketlik":
    "Murakkab ketma-ketliklar va bir nechta qoidalarni bir vaqtda aniqlash qobiliyati.",
  "Advanced vizual":
    "Murakkab vizual naqshlar va bir nechta o‘zgarishlarni kuzatish qobiliyati.",
};

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

function validateTelegramInitData(initData: string) {
  try {
    if (!BOT_TOKEN || !initData) {
      return null;
    }

    const params = new URLSearchParams(initData);

    const hash = params.get("hash");

    if (!hash) {
      return null;
    }

    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(BOT_TOKEN)
      .digest();

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (calculatedHash !== hash) {
      return null;
    }

    const userRaw = params.get("user");

    if (!userRaw) {
      return null;
    }

    return JSON.parse(userRaw) as TelegramUser;
  } catch {
    return null;
  }
}

function buildSections(answers: (string | null)[]) {
  return sectionRanges.map((section) => {
    let correct = 0;

    for (
      let i = section.start;
      i <= section.end;
      i++
    ) {
      if (
        answers[i] !== null &&
        answers[i] !== undefined &&
        answers[i] === answerKey[i]
      ) {
        correct++;
      }
    }

    const total =
      section.end - section.start + 1;

    return {
      name: section.name,
      icon: sectionIcons[section.name] ?? "🧠",
      score: correct,
      total,
      percentage: Math.round(
        (correct / total) * 100
      ),
    };
  });
}

async function preparePremiumAttempt(attempt: any) {
  let certificateId = attempt.certificate_id;
  let shareToken = attempt.share_token;

  if (!certificateId) {
    certificateId =
      `AQL-CERT-${crypto
        .randomBytes(5)
        .toString("hex")
        .toUpperCase()}`;
  }

  if (!shareToken) {
    shareToken =
      crypto.randomBytes(16).toString("hex");
  }

  if (
    certificateId !== attempt.certificate_id ||
    shareToken !== attempt.share_token
  ) {
    await supabaseAdmin
      .from("attempts")
      .update({
        certificate_id: certificateId,
        share_token: shareToken,
      })
      .eq("id", attempt.id);
  }

  const answers = Array.isArray(attempt.answers)
    ? attempt.answers
    : [];

  const sections = buildSections(answers);

  const sortedSections = [...sections].sort(
    (a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }

      return b.score - a.score;
    }
  );

  const strongestSection =
    sortedSections[0] ?? null;

  const secondStrongestSection =
    sortedSections[1] ?? null;

  const shareUrl = shareToken
    ? `https://aqltest.vercel.app/share/${shareToken}`
    : null;

  return {
    id: attempt.id,
    score: attempt.score,
    total: attempt.total,
    percentage: attempt.percentage,
    weightedScore:
      attempt.weighted_score ??
      attempt.percentage,
    timeUsed: attempt.time_used,
    answers: attempt.answers,
    certificateId,
    shareToken,
    shareUrl,
    sections,
    strongestSection: strongestSection
      ? {
          ...strongestSection,
          description:
            sectionDescriptions[
              strongestSection.name
            ] ?? "",
        }
      : null,
    secondStrongestSection:
      secondStrongestSection
        ? {
            ...secondStrongestSection,
            description:
              sectionDescriptions[
                secondStrongestSection.name
              ] ?? "",
          }
        : null,
  };
}

// =========================================================
// GET — localStorage attempt ID orqali
// =========================================================

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Attempt ID topilmadi.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("attempts")
        .select(
          `
          id,
          score,
          total,
          percentage,
          weighted_score,
          time_used,
          answers,
          is_premium,
          certificate_id,
          share_token,
          created_at
        `
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          error: "Natijani olishda xatolik.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Natija topilmadi.",
        },
        { status: 404 }
      );
    }

    if (!data.is_premium) {
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

    const premiumAttempt =
      await preparePremiumAttempt(data);

    return NextResponse.json({
      success: true,
      attempt: {
        id: premiumAttempt.id,
        score: premiumAttempt.score,
        total: premiumAttempt.total,
        percentage:
          premiumAttempt.percentage,
        weightedScore:
          premiumAttempt.weightedScore,
        timeUsed:
          premiumAttempt.timeUsed,
        answers: premiumAttempt.answers,
        certificateId:
          premiumAttempt.certificateId,
        shareToken:
          premiumAttempt.shareToken,
        shareUrl:
          premiumAttempt.shareUrl,
      },
      sections:
        premiumAttempt.sections,
      strongestSection:
        premiumAttempt.strongestSection,
      secondStrongestSection:
        premiumAttempt.secondStrongestSection,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Server xatosi.",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// POST — Telegram ichidan premium natijani olish
// =========================================================

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const telegramInitData =
      body?.telegramInitData;

    const telegramUser =
      validateTelegramInitData(
        telegramInitData
      );

    if (!telegramUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Telegram ma’lumotlari tasdiqlanmadi.",
        },
        { status: 401 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("attempts")
        .select(
          `
          id,
          score,
          total,
          percentage,
          weighted_score,
          time_used,
          answers,
          is_premium,
          certificate_id,
          share_token,
          created_at
        `
        )
        .eq(
          "telegram_user_id",
          telegramUser.id
        )
        .eq("is_premium", true)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          error:
            "Premium natijani olishda xatolik.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Sizda premium natija mavjud emas.",
          premiumRequired: true,
        },
        { status: 404 }
      );
    }

    const premiumAttempt =
      await preparePremiumAttempt(data);

    return NextResponse.json({
      success: true,
      telegramUserId:
        telegramUser.id,
      attempt: {
        id: premiumAttempt.id,
        score: premiumAttempt.score,
        total: premiumAttempt.total,
        percentage:
          premiumAttempt.percentage,
        weightedScore:
          premiumAttempt.weightedScore,
        timeUsed:
          premiumAttempt.timeUsed,
        answers: premiumAttempt.answers,
        certificateId:
          premiumAttempt.certificateId,
        shareToken:
          premiumAttempt.shareToken,
        shareUrl:
          premiumAttempt.shareUrl,
      },
      sections:
        premiumAttempt.sections,
      strongestSection:
        premiumAttempt.strongestSection,
      secondStrongestSection:
        premiumAttempt.secondStrongestSection,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Server xatosi.",
      },
      { status: 500 }
    );
  }
}