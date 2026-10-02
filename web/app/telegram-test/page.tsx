"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
      };
    };
  }
}

export default function TelegramTestPage() {
  const [status, setStatus] = useState("Telegram tekshirilmoqda...");
  const [user, setUser] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      setStatus(
        "Telegram WebApp topilmadi. Sahifani Telegram ichidan oching."
      );
      return;
    }

    webApp.ready();

    const initData = webApp.initData;

    if (!initData) {
      setStatus("Telegram initData topilmadi.");
      return;
    }

    async function authenticate() {
      try {
        const response = await fetch("/api/telegram/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus(data.error || "Telegram autentifikatsiyasi muvaffaqiyatsiz.");
          return;
        }

        setUser(data.user);
        setStatus("Telegram muvaffaqiyatli ulandi.");
      } catch (error) {
        console.error(error);
        setStatus("Server bilan bog‘lanishda xatolik.");
      }
    }

    authenticate();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">
          Telegram Test
        </h1>

        <p className="text-slate-300 mb-5">
          {status}
        </p>

        {user && (
          <div className="bg-slate-800 rounded-xl p-4 space-y-2">
            <p>
              <span className="text-slate-400">Telegram ID:</span>{" "}
              <strong>{user.id}</strong>
            </p>

            <p>
              <span className="text-slate-400">Ism:</span>{" "}
              {user.firstName}
            </p>

            {user.lastName && (
              <p>
                <span className="text-slate-400">Familiya:</span>{" "}
                {user.lastName}
              </p>
            )}

            {user.username && (
              <p>
                <span className="text-slate-400">Username:</span>{" "}
                @{user.username}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}