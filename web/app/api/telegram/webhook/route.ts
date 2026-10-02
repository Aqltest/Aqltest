import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const MAIN_KEYBOARD = {
  keyboard: [
    [
      {
        text: "🧠 TESTNI BOSHLASH",
        web_app: {
          url: "https://aqltest.vercel.app/test",
        },
      },
    ],
    [
      {
        text: "💎 PREMIUM NATIJAM",
        web_app: {
          url: "https://aqltest.vercel.app/premium",
        },
      },
      {
        text: "🏆 REYTING",
      },
    ],
    [
      {
        text: "📜 SERTIFIKAT",
      },
      {
        text: "💰 TO‘LOV",
      },
    ],
    [
      {
        text: "ℹ️ YORDAM",
      },
      {
        text: "🌐 TIL",
      },
    ],
  ],
  resize_keyboard: true,
  persistent: true,
  input_field_placeholder: "Bo‘limni tanlang",
};

async function sendTelegramMessage(
  chatId: number,
  text: string,
  replyMarkup?: unknown
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN topilmadi."
    );
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

export async function POST(request: Request) {
  try {
    const update = await request.json();

    const message = update?.message;

    if (!message) {
      return NextResponse.json({
        ok: true,
      });
    }

    const chatId = message.chat?.id;
    const telegramUserId = message.from?.id;
    const text = message.text?.trim();

    if (!chatId || !telegramUserId) {
      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // START
    // =========================

    if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        `🧠 AqlTest'ga xush kelibsiz!

Mantiqiy fikrlash qobiliyatingizni
24 ta savol orqali sinab ko‘ring.

⏱ 12 daqiqa
🧩 6 ta yo‘nalish
💎 Premium natija
🏆 Reyting
📜 Sertifikat

Boshlash uchun:
🧠 TESTNI BOSHLASH tugmasini bosing.`,
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // HELP
    // =========================

    if (text === "ℹ️ YORDAM") {
      await sendTelegramMessage(
        chatId,
        `ℹ️ AqlTest haqida

🧠 24 ta mantiqiy savol
⏱ 12 daqiqalik test
💎 Premium natija
📜 Sertifikat
🏆 Reyting

Testni boshlash uchun
🧠 TESTNI BOSHLASH tugmasini bosing.

Premium kod bo‘lsa, uni shu chatga
AQL-XXXXXXXXXX formatida yuborishingiz mumkin.`,
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // LANGUAGE
    // =========================

    if (text === "🌐 TIL") {
      await sendTelegramMessage(
        chatId,
        `🌐 Til

Hozircha AqlTest o‘zbek tilida ishlaydi. 🇺🇿

Boshqa tillar keyingi yangilanishlarda qo‘shiladi.`,
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // RANKING
    // =========================

    if (text === "🏆 REYTING") {
      await sendTelegramMessage(
        chatId,
        `🏆 AqlTest Reyting

Reyting tizimi hozir tayyorlanmoqda.

Premium foydalanuvchilar uchun
eng yaxshi natijalar reytingi
tez orada ishga tushadi.`,
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // CERTIFICATE
    // =========================

    if (text === "📜 SERTIFIKAT") {
      await sendTelegramMessage(
        chatId,
        `📜 Sertifikat

Sertifikat premium natija bilan
birga taqdim etiladi.

Avval testni ishlab,
premium natijani oching.`,
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // PAYMENT
    // =========================

    if (text === "💰 TO‘LOV") {
      await sendTelegramMessage(
        chatId,
        `💰 Premium

Batafsil natija narxi:
7 900 so‘m

To‘lov tizimi hozir ulanmoqda.
Click integratsiyasi tayyor bo‘lgach,
shu bo‘lim orqali to‘lovni amalga oshirish
mumkin bo‘ladi.`,
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // PREMIUM CODE
    // =========================

    if (!text) {
      return NextResponse.json({
        ok: true,
      });
    }

    const code = text.toUpperCase();

    if (!/^AQL-[A-F0-9]{10}$/.test(code)) {
      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // FIND PREMIUM CODE
    // =========================

    const { data: attempt, error } =
      await supabaseAdmin
        .from("attempts")
        .select(
          "id, telegram_user_id, premium_code, is_premium"
        )
        .eq("premium_code", code)
        .maybeSingle();

    if (error) {
      console.error(
        "Premium code search error:",
        error
      );

      await sendTelegramMessage(
        chatId,
        "⚠️ Serverda xatolik yuz berdi. Birozdan keyin yana urinib ko‘ring.",
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    if (!attempt) {
      await sendTelegramMessage(
        chatId,
        "❌ Bunday premium kod topilmadi.\n\nKodni qayta tekshirib yuboring.",
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // TELEGRAM USER CHECK
    // =========================

    if (
      attempt.telegram_user_id !== null &&
      Number(attempt.telegram_user_id) !==
        Number(telegramUserId)
    ) {
      await sendTelegramMessage(
        chatId,
        "❌ Bu premium kod boshqa Telegram akkauntiga tegishli.",
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // ALREADY PREMIUM
    // =========================

    if (attempt.is_premium) {
      await sendTelegramMessage(
        chatId,
        "✅ Bu premium kod allaqachon faollashtirilgan.",
        MAIN_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =========================
    // PAYMENT WAITING
    // =========================

    await sendTelegramMessage(
      chatId,
      `✅ Premium kod topildi!

Kod: ${code}

💳 To‘lov holati: kutilmoqda.

To‘lov tizimi ulanmagani sababli
premium hali ochilmadi.

To‘lov tasdiqlangach premium
avtomatik faollashtiriladi.`,
      MAIN_KEYBOARD
    );

    return NextResponse.json({
      ok: true,
      found: true,
      attemptId: attempt.id,
      paid: false,
    });
  } catch (error) {
    console.error(
      "Telegram webhook error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
      },
      { status: 500 }
    );
  }
}