import { NextResponse } from "next/server";
import crypto from "crypto";

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

    const initData = body?.initData;

    if (!initData || typeof initData !== "string") {
      return NextResponse.json(
        { error: "Telegram initData topilmadi." },
        { status: 400 }
      );
    }

    const user = validateTelegramInitData(initData);

    if (!user) {
      return NextResponse.json(
        { error: "Telegram ma'lumotlari tasdiqlanmadi." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        username: user.username ?? "",
      },
    });
  } catch (error) {
    console.error("Telegram auth error:", error);

    return NextResponse.json(
      { error: "Telegram autentifikatsiyasida xatolik." },
      { status: 500 }
    );
  }
}