import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

async function sendTelegramMessage(
  chatId: number,
  text: string
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN topilmadi.");
  }

  await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
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

    // /start
    if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        "🧠 AqlTest premium\n\nPremium kodingizni shu yerga yuboring.\n\nMasalan:\nAQL-ABC1234567"
      );

      return NextResponse.json({
        ok: true,
      });
    }

    if (!text) {
      return NextResponse.json({
        ok: true,
      });
    }

    // Premium kod formatini tekshirish
    const code = text.toUpperCase();

    if (!/^AQL-[A-F0-9]{10}$/.test(code)) {
      await sendTelegramMessage(
        chatId,
        "❌ Premium kod noto‘g‘ri formatda.\n\nKodni AQL-XXXXXXXXXX ko‘rinishida yuboring."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // Kodni Supabase'dan qidirish
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
        "⚠️ Serverda xatolik yuz berdi. Birozdan keyin yana urinib ko‘ring."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    if (!attempt) {
      await sendTelegramMessage(
        chatId,
        "❌ Bunday premium kod topilmadi.\n\nKodni qayta tekshirib yuboring."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // Kod boshqa Telegram akkauntiga tegishli bo‘lsa
    if (
      attempt.telegram_user_id !== null &&
      Number(attempt.telegram_user_id) !==
        Number(telegramUserId)
    ) {
      await sendTelegramMessage(
        chatId,
        "❌ Bu premium kod boshqa Telegram akkauntiga tegishli."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // Premium allaqachon ochilgan bo‘lsa
    if (attempt.is_premium) {
      await sendTelegramMessage(
        chatId,
        "✅ Bu premium kod allaqachon faollashtirilgan."
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // Hozircha TO‘LOVNI ochmaymiz.
    await sendTelegramMessage(
      chatId,
      `✅ Premium kod topildi!\n\nKod: ${code}\n\n💳 To‘lov holati: kutilmoqda.\n\nTo‘lov tizimi ulanmaganligi sababli premium hali ochilmadi.`
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