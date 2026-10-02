import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const TEST_URL =
  "https://aqltest.vercel.app/test";

const RESULT_URL =
  "https://aqltest.vercel.app/result";

const PREMIUM_URL =
  "https://aqltest.vercel.app/premium";

const RANKING_URL =
  "https://aqltest.vercel.app/ranking";

const ADMIN_TELEGRAM_ID =
  process.env.ADMIN_TELEGRAM_ID ?? "";

// =========================================================
// KEYBOARDS
// =========================================================

const NEW_USER_KEYBOARD = {
  keyboard: [
    [
      {
        text: "🧠 TESTNI BOSHLASH",
        web_app: {
          url: TEST_URL,
        },
      },
    ],
    [
      {
        text: "🏆 REYTING",
        web_app: {
          url: RANKING_URL,
        },
      },
    ],
    [
      {
        text: "💰 TO‘LOV",
      },
      {
        text: "ℹ️ YORDAM",
      },
    ],
    [
      {
        text: "🌐 TIL",
      },
    ],
  ],
  resize_keyboard: true,
  persistent: true,
  input_field_placeholder:
    "Bo‘limni tanlang",
};

const USED_USER_KEYBOARD = {
  keyboard: [
    [
      {
        text: "📊 NATIJAM",
        web_app: {
          url: RESULT_URL,
        },
      },
      {
        text: "💎 PREMIUM NATIJAM",
        web_app: {
          url: PREMIUM_URL,
        },
      },
    ],
    [
      {
        text: "🏆 REYTING",
        web_app: {
          url: RANKING_URL,
        },
      },
      {
        text: "📜 SERTIFIKAT",
        web_app: {
          url: PREMIUM_URL,
        },
      },
    ],
    [
      {
        text: "💰 TO‘LOV",
      },
      {
        text: "ℹ️ YORDAM",
      },
    ],
    [
      {
        text: "🌐 TIL",
      },
    ],
    [
      {
        text: "🏠 ASOSIY MENU",
      },
    ],
  ],
  resize_keyboard: true,
  persistent: true,
  input_field_placeholder:
    "Bo‘limni tanlang",
};

const PREMIUM_USER_KEYBOARD = {
  keyboard: [
    [
      {
        text: "💎 PREMIUM NATIJAM",
        web_app: {
          url: PREMIUM_URL,
        },
      },
      {
        text: "🏆 REYTING",
        web_app: {
          url: RANKING_URL,
        },
      },
    ],
    [
      {
        text: "📜 SERTIFIKAT",
        web_app: {
          url: PREMIUM_URL,
        },
      },
      {
        text: "📊 NATIJAM",
        web_app: {
          url: RESULT_URL,
        },
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
    [
      {
        text: "🏠 ASOSIY MENU",
      },
    ],
  ],
  resize_keyboard: true,
  persistent: true,
  input_field_placeholder:
    "Bo‘limni tanlang",
};

// =========================================================
// SEND TELEGRAM MESSAGE
// =========================================================

async function sendTelegramMessage(
  chatId: number,
  text: string,
  replyMarkup?: unknown
) {
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN;

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

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    console.error(
      "Telegram sendMessage error:",
      await response.text()
    );
  }
}

// =========================================================
// GET TELEGRAM USER PROFILE
// =========================================================

async function getTelegramUser(
  telegramUserId: number
) {
  const { data, error } =
    await supabaseAdmin
      .from("telegram_users")
      .select(
        "telegram_user_id, display_name, awaiting_name"
      )
      .eq(
        "telegram_user_id",
        telegramUserId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Telegram user query error:",
      error
    );

    return null;
  }

  return data;
}

// =========================================================
// CREATE TELEGRAM USER
// =========================================================

async function createTelegramUser(
  telegramUserId: number
) {
  const { data, error } =
    await supabaseAdmin
      .from("telegram_users")
      .insert({
        telegram_user_id:
          telegramUserId,
        display_name: null,
        awaiting_name: true,
      })
      .select(
        "telegram_user_id, display_name, awaiting_name"
      )
      .single();

  if (error) {
    console.error(
      "Telegram user create error:",
      error
    );

    return null;
  }

  return data;
}

// =========================================================
// SAVE DISPLAY NAME
// =========================================================

async function saveDisplayName(
  telegramUserId: number,
  displayName: string
) {
  const { data, error } =
    await supabaseAdmin
      .from("telegram_users")
      .update({
        display_name: displayName,
        awaiting_name: false,
        updated_at: new Date().toISOString(),
      })
      .eq(
        "telegram_user_id",
        telegramUserId
      )
      .select(
        "telegram_user_id, display_name, awaiting_name"
      )
      .single();

  if (error) {
    console.error(
      "Display name save error:",
      error
    );

    return null;
  }

  return data;
}

// =========================================================
// GET USER'S LATEST ATTEMPT
// =========================================================

async function getUserAttempt(
  telegramUserId: number
) {
  const { data, error } =
    await supabaseAdmin
      .from("attempts")
      .select(
        "id, score, total, weighted_score, time_used, is_premium, premium_code, premium_paid_at, created_at"
      )
      .eq(
        "telegram_user_id",
        telegramUserId
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (error) {
    console.error(
      "User attempt query error:",
      error
    );

    return null;
  }

  return data;
}

// =========================================================
// GET USER'S BEST RANKING POSITION
// =========================================================

async function getUserRankingPosition(
  telegramUserId: number
) {
  const { data: attempts, error } =
    await supabaseAdmin
      .from("attempts")
      .select(
        "telegram_user_id, weighted_score, created_at"
      )
      .eq("is_premium", true)
      .not(
        "telegram_user_id",
        "is",
        null
      )
      .not(
        "weighted_score",
        "is",
        null
      )
      .order("weighted_score", {
        ascending: false,
      })
      .order("created_at", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Ranking position error:",
      error
    );

    return null;
  }

  const bestByUser = new Map<
    number,
    number
  >();

  for (const attempt of attempts ?? []) {
    const userId = Number(
      attempt.telegram_user_id
    );

    if (bestByUser.has(userId)) {
      continue;
    }

    bestByUser.set(
      userId,
      Number(attempt.weighted_score)
    );
  }

  const users = Array.from(
    bestByUser.entries()
  ).sort(
    (a, b) => b[1] - a[1]
  );

  const position = users.findIndex(
    ([userId]) =>
      userId ===
      Number(telegramUserId)
  );

  if (position === -1) {
    return null;
  }

  return position + 1;
}

// =========================================================
// GET USER KEYBOARD
// =========================================================

async function getUserKeyboard(
  telegramUserId: number
) {
  const attempt =
    await getUserAttempt(
      telegramUserId
    );

  if (!attempt) {
    return NEW_USER_KEYBOARD;
  }

  if (attempt.is_premium) {
    return PREMIUM_USER_KEYBOARD;
  }

  return USED_USER_KEYBOARD;
}

// =========================================================
// MAIN WEBHOOK
// =========================================================

export async function POST(
  request: Request
) {
  try {
    const update =
      await request.json();

    const message =
      update?.message;

    if (!message) {
      return NextResponse.json({
        ok: true,
      });
    }

    const chatId =
      message.chat?.id;

    const telegramUserId =
      message.from?.id;

    const text =
      message.text?.trim();

    if (
      !chatId ||
      !telegramUserId
    ) {
      return NextResponse.json({
        ok: true,
      });
    }

    const userId =
      Number(telegramUserId);

    // =======================================================
    // USER PROFILE
    // =======================================================

    let telegramUser =
      await getTelegramUser(
        userId
      );

    // =======================================================
    // FIRST CONTACT
    // =======================================================

    if (!telegramUser) {
      telegramUser =
        await createTelegramUser(
          userId
        );

      if (!telegramUser) {
        return NextResponse.json(
          {
            ok: false,
          },
          {
            status: 500,
          }
        );
      }

      await sendTelegramMessage(
        chatId,
        `🧠 AqlTest'ga xush kelibsiz!

Testni boshlashdan oldin
ismingizni kiriting.

Masalan:
Mehriddin

👇 Ism-familiyangizni yozing:`,
        {
          remove_keyboard: true,
        }
      );

      return NextResponse.json({
        ok: true,
        awaitingName: true,
      });
    }

    // =======================================================
    // WAITING FOR NAME
    // =======================================================

    if (
      telegramUser.awaiting_name
    ) {
      if (
        !text ||
        text.startsWith("/")
      ) {
        await sendTelegramMessage(
          chatId,
          `👤 Avval ismingizni kiriting.

Masalan:
Mehriddin Abdurahimov`
        );

        return NextResponse.json({
          ok: true,
          awaitingName: true,
        });
      }

      // Menu tugmalarini ism sifatida
      // saqlab yubormaslik
      const menuTexts = new Set([
        "🧠 TESTNI BOSHLASH",
        "📊 NATIJAM",
        "💎 PREMIUM NATIJAM",
        "🏆 REYTING",
        "📜 SERTIFIKAT",
        "💰 TO‘LOV",
        "ℹ️ YORDAM",
        "🌐 TIL",
        "🏠 ASOSIY MENU",
      ]);

      if (menuTexts.has(text)) {
        await sendTelegramMessage(
          chatId,
          `👤 Avval ismingizni kiriting.

Masalan:
Mehriddin Abdurahimov`
        );

        return NextResponse.json({
          ok: true,
          awaitingName: true,
        });
      }

      const displayName =
        text
          .replace(/\s+/g, " ")
          .trim();

      if (
        displayName.length < 2 ||
        displayName.length > 60
      ) {
        await sendTelegramMessage(
          chatId,
          `❌ Ism juda qisqa yoki juda uzun.

Iltimos, ism-familiyangizni
to‘g‘ri kiriting.`
        );

        return NextResponse.json({
          ok: true,
          awaitingName: true,
        });
      }

      const savedUser =
        await saveDisplayName(
          userId,
          displayName
        );

      if (!savedUser) {
        await sendTelegramMessage(
          chatId,
          "⚠️ Ismni saqlashda xatolik yuz berdi. Birozdan keyin yana urinib ko‘ring."
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const attempt =
        await getUserAttempt(
          userId
        );

      if (attempt?.is_premium) {
        const rank =
          await getUserRankingPosition(
            userId
          );

        const rankText =
          rank !== null
            ? `🏆 Reytingdagi o‘rningiz: ${rank}`
            : "🏆 Reyting: hisoblanmoqda";

        await sendTelegramMessage(
          chatId,
          `✅ Rahmat, ${displayName}!

🧠 AqlTest profilingiz tayyor.

✅ Premium faol
🧠 AqlTest Score: ${
            attempt.weighted_score ??
            "—"
          }

${rankText}

👇 Kerakli bo‘limni tanlang.`,
          PREMIUM_USER_KEYBOARD
        );
      } else if (attempt) {
        await sendTelegramMessage(
          chatId,
          `✅ Rahmat, ${displayName}!

🧠 AqlTest profilingiz tayyor.

✅ Test topshirilgan
🧠 AqlTest Score: ${
            attempt.weighted_score ??
            "—"
          }

💎 Premium: faol emas

👇 Kerakli bo‘limni tanlang.`,
          USED_USER_KEYBOARD
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `✅ Rahmat, ${displayName}!

🧠 AqlTest profilingiz tayyor.

24 ta savol
⏱ 12 daqiqa
💎 Premium natija
🏆 Reyting
📜 Sertifikat

👇 Testni boshlang.`,
          NEW_USER_KEYBOARD
        );
      }

      return NextResponse.json({
        ok: true,
        nameSaved: true,
      });
    }

    // =======================================================
    // START / MENU
    // =======================================================

    if (
      text === "/start" ||
      text?.startsWith("/start ") ||
      text === "/menu" ||
      text === "🏠 ASOSIY MENU"
    ) {
      const attempt =
        await getUserAttempt(
          userId
        );

      const displayName =
        telegramUser.display_name ||
        "do‘st";

      // NEW USER

      if (!attempt) {
        await sendTelegramMessage(
          chatId,
          `🧠 Xush kelibsiz, ${displayName}!

24 ta mantiqiy savol orqali
o‘zingizni sinab ko‘ring.

⏱ 12 daqiqa
🧩 6 ta yo‘nalish
💎 Premium natija
🏆 Reyting
📜 Sertifikat

👇 Testni boshlash uchun
🧠 TESTNI BOSHLASH tugmasini bosing.`,
          NEW_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      // PREMIUM USER

      if (attempt.is_premium) {
        const rank =
          await getUserRankingPosition(
            userId
          );

        const rankText =
          rank !== null
            ? `🏆 Reytingdagi o‘rningiz: ${rank}`
            : "🏆 Reyting: hisoblanmoqda";

        await sendTelegramMessage(
          chatId,
          `🧠 Xush kelibsiz, ${displayName}!

✅ Premium faol
🧠 AqlTest Score: ${
            attempt.weighted_score ??
            "—"
          }

${rankText}

📜 Sertifikatingiz tayyor.

👇 Kerakli bo‘limni tanlang.`,
          PREMIUM_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      // USED USER

      await sendTelegramMessage(
        chatId,
        `🧠 Xush kelibsiz, ${displayName}!

✅ Test topshirilgan
🧠 AqlTest Score: ${
          attempt.weighted_score ??
          "—"
        }

💎 Premium: faol emas
🏆 Reyting: premiumdan keyin
📜 Sertifikat: premiumdan keyin

👇 Kerakli bo‘limni tanlang.`,
        USED_USER_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // RESULT
    // =======================================================

    if (
      text === "📊 NATIJAM" ||
      text === "/result"
    ) {
      const attempt =
        await getUserAttempt(
          userId
        );

      if (!attempt) {
        await sendTelegramMessage(
          chatId,
          `📊 Sizda hali natija yo‘q.

Avval AqlTest testini
ishlab ko‘ring.`,
          NEW_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const minutes =
        Math.floor(
          (attempt.time_used ?? 0) /
            60
        );

      const seconds =
        (attempt.time_used ?? 0) %
        60;

      const formattedTime =
        `${minutes}:${String(
          seconds
        ).padStart(2, "0")}`;

      await sendTelegramMessage(
        chatId,
        `📊 SIZNING NATIJANGIZ

🧠 AqlTest Score: ${
          attempt.weighted_score ??
          attempt.score ??
          "—"
        }

⏱ Sarflangan vaqt:
${formattedTime}

📝 Savollar:
${attempt.total}

${
  attempt.is_premium
    ? "✅ Premium faol"
    : "💎 Premium: faol emas"
}

${
  attempt.is_premium
    ? "🏆 Reyting va sertifikat ham faol."
    : "🔒 Batafsil tahlil premium orqali ochiladi."
}`,
        attempt.is_premium
          ? PREMIUM_USER_KEYBOARD
          : USED_USER_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // HELP
    // =======================================================

    if (
      text === "/help" ||
      text === "ℹ️ YORDAM"
    ) {
      await sendTelegramMessage(
        chatId,
        `ℹ️ AqlTest yordam

🧠 Test — 24 ta savol
⏱ Vaqt — 12 daqiqa
💎 Premium — batafsil tahlil
🏆 Reyting — premium foydalanuvchilar
📜 Sertifikat — premium natijadan so‘ng

Premium kod bo‘lsa,
AQL-XXXXXXXXXX formatida
shu chatga yuboring.`,
        await getUserKeyboard(
          userId
        )
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // PAYMENT
    // =======================================================

    if (
      text === "💰 TO‘LOV" ||
      text === "/payment"
    ) {
      await sendTelegramMessage(
        chatId,
        `💰 AqlTest Premium

Premium batafsil natija:
7 900 so‘m

Premium tarkibi:

✓ 6 ta yo‘nalish bo‘yicha tahlil
✓ Kuchli yo‘nalishingiz
✓ Percentile
✓ Sertifikat
✓ AqlTest reytingi

💳 To‘lov tizimi:
Click integratsiyasi tayyorlanmoqda.`,
        await getUserKeyboard(
          userId
        )
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // LANGUAGE
    // =======================================================

    if (
      text === "/language" ||
      text === "🌐 TIL"
    ) {
      await sendTelegramMessage(
        chatId,
        `🌐 Til

🇺🇿 O‘zbek tili — faol

🇷🇺 Русский — tez orada
🇬🇧 English — tez orada`,
        await getUserKeyboard(
          userId
        )
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // RANKING
    // =======================================================

    if (
      text === "/ranking" ||
      text === "🏆 REYTING"
    ) {
      await sendTelegramMessage(
        chatId,
        `🏆 AqlTest Reyting

Eng yuqori AqlTest Score
natijalarini ko‘ring.

Faqat premium natijalar
reytingda hisobga olinadi.

👇 Reytingni oching:
🏆 REYTING`,
        await getUserKeyboard(
          userId
        )
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // CERTIFICATE
    // =======================================================

    if (
      text === "/certificate" ||
      text === "📜 SERTIFIKAT"
    ) {
      const attempt =
        await getUserAttempt(
          userId
        );

      if (!attempt) {
        await sendTelegramMessage(
          chatId,
          `📜 Sertifikat

Avval AqlTest testini
ishlab ko‘ring.`,
          NEW_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      if (!attempt.is_premium) {
        await sendTelegramMessage(
          chatId,
          `📜 Sertifikat

Sertifikat premium natija
bilan birga ochiladi.

💎 Avval premium natijani
oching.`,
          USED_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      await sendTelegramMessage(
        chatId,
        `📜 Sertifikatingiz tayyor.

👇 Sertifikat sahifasini oching:
📜 SERTIFIKAT`,
        PREMIUM_USER_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // PREMIUM
    // =======================================================

    if (
      text === "/premium" ||
      text === "💎 PREMIUM NATIJAM"
    ) {
      const attempt =
        await getUserAttempt(
          userId
        );

      if (!attempt) {
        await sendTelegramMessage(
          chatId,
          `💎 Premium natija

Avval AqlTest testini
ishlab ko‘ring.`,
          NEW_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      if (!attempt.is_premium) {
        await sendTelegramMessage(
          chatId,
          `💎 Premium natija

Batafsil tahlil hali ochilmagan.

👇 Avval natijangizni ko‘ring:
📊 NATIJAM`,
          USED_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      await sendTelegramMessage(
        chatId,
        `✅ Premium natija faol.

👇 Batafsil natijani oching:
💎 PREMIUM NATIJAM`,
        PREMIUM_USER_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // ADMIN PREMIUM ACTIVATION
    // =======================================================

    if (
      text?.startsWith(
        "/premium_on "
      )
    ) {
      if (
        String(userId) !==
        ADMIN_TELEGRAM_ID
      ) {
        await sendTelegramMessage(
          chatId,
          "❌ Bu buyruq faqat administrator uchun.",
          await getUserKeyboard(
            userId
          )
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const code =
        text
          .replace(
            "/premium_on ",
            ""
          )
          .trim()
          .toUpperCase();

      if (
        !/^AQL-[A-F0-9]{10}$/.test(
          code
        )
      ) {
        await sendTelegramMessage(
          chatId,
          `❌ Kod formati noto‘g‘ri.

To‘g‘ri format:
AQL-XXXXXXXXXX`,
          PREMIUM_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const {
        data: attempt,
        error,
      } = await supabaseAdmin
        .from("attempts")
        .select(
          "id, telegram_user_id, premium_code, is_premium"
        )
        .eq(
          "premium_code",
          code
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Admin premium lookup error:",
          error
        );

        await sendTelegramMessage(
          chatId,
          "⚠️ Serverda xatolik yuz berdi.",
          PREMIUM_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      if (!attempt) {
        await sendTelegramMessage(
          chatId,
          "❌ Bunday premium kod topilmadi.",
          PREMIUM_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      if (attempt.is_premium) {
        await sendTelegramMessage(
          chatId,
          `ℹ️ Bu kod allaqachon premium faol.

Kod:
${code}`,
          PREMIUM_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      const { error: updateError } =
        await supabaseAdmin
          .from("attempts")
          .update({
            is_premium: true,
          })
          .eq(
            "id",
            attempt.id
          );

      if (updateError) {
        console.error(
          "Admin premium update error:",
          updateError
        );

        await sendTelegramMessage(
          chatId,
          "❌ Premiumni faollashtirishda xatolik yuz berdi.",
          PREMIUM_USER_KEYBOARD
        );

        return NextResponse.json({
          ok: true,
        });
      }

      await sendTelegramMessage(
        chatId,
        `✅ Premium muvaffaqiyatli faollashtirildi!

Kod:
${code}

Foydalanuvchi endi:
💎 Premium natija
🏆 Reyting
📜 Sertifikat

dan foydalanishi mumkin.`,
        PREMIUM_USER_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
        premium: true,
        attemptId: attempt.id,
      });
    }

    // =======================================================
    // EMPTY
    // =======================================================

    if (!text) {
      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // PREMIUM CODE
    // =======================================================

    const code =
      text.toUpperCase();

    if (
      !/^AQL-[A-F0-9]{10}$/.test(
        code
      )
    ) {
      await sendTelegramMessage(
        chatId,
        `🧠 AqlTest

Kerakli bo‘limni menyudan
tanlang.

Agar premium kodingiz bo‘lsa,
AQL-XXXXXXXXXX formatida
yuboring.`,
        await getUserKeyboard(
          userId
        )
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // =======================================================
    // FIND PREMIUM CODE
    // =======================================================

    const {
      data: attempt,
      error,
    } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, telegram_user_id, premium_code, is_premium"
      )
      .eq(
        "premium_code",
        code
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Premium code search error:",
        error
      );

      await sendTelegramMessage(
        chatId,
        "⚠️ Serverda xatolik yuz berdi. Birozdan keyin yana urinib ko‘ring.",
        await getUserKeyboard(
          userId
        )
      );

      return NextResponse.json({
        ok: true,
      });
    }

    if (!attempt) {
      await sendTelegramMessage(
        chatId,
        `❌ Premium kod topilmadi.

Kodni qayta tekshirib yuboring.`,
        await getUserKeyboard(
          userId
        )
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // TELEGRAM USER CHECK

    if (
      attempt.telegram_user_id !==
        null &&
      Number(
        attempt.telegram_user_id
      ) !== userId
    ) {
      await sendTelegramMessage(
        chatId,
        `❌ Bu premium kod boshqa
Telegram akkauntiga tegishli.

Iltimos, testni ishlagan
Telegram akkauntingizdan
foydalaning.`,
        await getUserKeyboard(
          userId
        )
      );

      return NextResponse.json({
        ok: true,
      });
    }

    // ALREADY PREMIUM

    if (attempt.is_premium) {
      await sendTelegramMessage(
        chatId,
        `✅ Premium allaqachon faol!

Batafsil natijangiz,
sertifikatingiz va
reytingdagi o‘rningiz
ochiq.`,
        PREMIUM_USER_KEYBOARD
      );

      return NextResponse.json({
        ok: true,
        premium: true,
        attemptId: attempt.id,
      });
    }

    // PAYMENT WAITING

    await sendTelegramMessage(
      chatId,
      `✅ Premium kod topildi!

Kod:
${code}

💳 To‘lov holati:
Kutilmoqda

7 900 so‘mlik to‘lov
tasdiqlangach premium
avtomatik faollashtiriladi.`,
      USED_USER_KEYBOARD
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
      {
        status: 500,
      }
    );
  }
}