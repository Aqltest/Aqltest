"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ResultData = {
  score: number;
  total: number;
  percentage: number;
  timeUsed: number;
  answers: (string | null)[];
  premiumCode: string | null;
};

export default function ResultPage() {
  const router = useRouter();

  const [result, setResult] =
    useState<ResultData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const attemptId =
          localStorage.getItem(
            "aqltest_attempt_id"
          );

        if (!attemptId) {
          setResult(null);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/attempt/result?id=${attemptId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error(
            "Natija olinmadi:",
            data
          );

          setResult(null);
          setLoading(false);
          return;
        }

        const attempt = data.attempt;

        setResult({
          score: attempt.score,
          total: attempt.total,
          percentage: attempt.percentage,
          timeUsed: attempt.time_used,
          answers: attempt.answers,
          premiumCode: attempt.premium_code ?? null,
        });
      } catch (error) {
        console.error(
          "Natijani olishda xatolik:",
          error
        );

        setResult(null);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">

          <div className="text-4xl mb-3">
            🧠
          </div>

          <h1 className="text-xl sm:text-2xl font-bold">
            Natija yuklanmoqda...
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Natijangiz serverdan olinmoqda.
          </p>

        </div>
      </main>
    );
  }

  // =========================
  // RESULT NOT FOUND
  // =========================

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">

          <div className="text-5xl mb-4">
            🧠
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            Natija topilmadi
          </h1>

          <p className="text-slate-400 text-sm mb-5">
            Avval IQ testni ishlab ko‘ring.
          </p>

          <button
            onClick={() => router.push("/test")}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-bold text-sm transition"
          >
            IQ TESTNI BOSHLASH
          </button>

        </div>
      </main>
    );
  }

  // =========================
  // TIME
  // =========================

  const minutes = Math.floor(
    result.timeUsed / 60
  );

  const seconds = result.timeUsed % 60;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-2.5 py-4 sm:px-4 sm:py-6">

      <div className="w-full max-w-lg mx-auto">

        <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 shadow-2xl">

          {/* =========================
              HEADER
          ========================= */}

          <div className="text-center mb-5 sm:mb-6">

            <div className="text-4xl sm:text-5xl mb-2">
              🧠
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold">
              Test yakunlandi!
            </h1>

            <p className="text-slate-400 text-sm mt-1.5">
              Natijangiz tayyor.
            </p>

          </div>

          {/* =========================
              MAIN RESULT
          ========================= */}

          <div className="bg-slate-800 rounded-2xl p-4 sm:p-5 text-center mb-3">

            <div className="text-slate-400 text-xs sm:text-sm">
              Umumiy natijangiz
            </div>

            <div className="text-5xl sm:text-6xl font-bold text-blue-400 mt-1">
              {result.percentage}%
            </div>

          </div>

          {/* =========================
              QUICK STATS
          ========================= */}

          <div className="grid grid-cols-2 gap-2 mb-4">

            <div className="bg-slate-800 rounded-xl px-3 py-3 text-center">

              <div className="text-slate-400 text-[11px] sm:text-xs">
                Sarflangan vaqt
              </div>

              <div className="text-lg font-bold mt-0.5">
                {minutes}:
                {String(seconds).padStart(2, "0")}
              </div>

            </div>

            <div className="bg-slate-800 rounded-xl px-3 py-3 text-center">

              <div className="text-slate-400 text-[11px] sm:text-xs">
                Savollar
              </div>

              <div className="text-lg font-bold mt-0.5">
                {result.total}
              </div>

            </div>

          </div>

          {/* =========================
              PREMIUM CODE
          ========================= */}

          {result.premiumCode && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 sm:p-5 mb-4">

              <div className="text-blue-400 text-xs font-bold mb-1.5">
                PREMIUM KOD
              </div>

              <h2 className="text-base sm:text-lg font-bold mb-2">
                Sizning maxsus kodingiz
              </h2>

              <div className="bg-slate-950 rounded-xl px-4 py-3 text-center border border-slate-700">
                <div className="text-xl sm:text-2xl font-bold tracking-wider text-white break-all">
                  {result.premiumCode}
                </div>
              </div>

              <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed mt-2.5">
                Ushbu kod premium natijani ochish uchun
                kerak bo‘ladi. To‘lovdan so‘ng kodni
                Telegram botga yuborasiz.
              </p>

            </div>
          )}

          {/* =========================
              SHORT PREVIEW
          ========================= */}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-3.5 mb-4">

            <div className="text-blue-400 text-xs font-semibold mb-1.5">
              NATIJANGIZ HAQIDA
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Test natijangiz tayyor.
              Batafsil tahlilda natijangizning
              turli yo‘nalishlar bo‘yicha
              taqsimlanishini ko‘rishingiz mumkin.
            </p>

          </div>

          {/* =========================
              LOCKED ANALYSIS
          ========================= */}

          <div className="mb-5">

            <h2 className="text-base sm:text-lg font-bold mb-2.5">
              🔒 Batafsil tahlil
            </h2>

            <div className="space-y-1.5">

              {/* SONLI */}

              <div className="bg-slate-800 rounded-lg px-3 py-2.5">

                <div className="flex items-center gap-2">

                  <span className="text-lg">
                    🧮
                  </span>

                  <div className="flex-1 min-w-0">

                    <div className="font-semibold text-xs sm:text-sm">
                      Sonli mantiq
                    </div>

                    <div className="text-[10px] sm:text-xs text-slate-500">
                      Natija yopilgan
                    </div>

                  </div>

                  <span className="text-sm">
                    🔒
                  </span>

                </div>

              </div>

              {/* VIZUAL */}

              <div className="bg-slate-800 rounded-lg px-3 py-2.5">

                <div className="flex items-center gap-2">

                  <span className="text-lg">
                    🧩
                  </span>

                  <div className="flex-1 min-w-0">

                    <div className="font-semibold text-xs sm:text-sm">
                      Vizual mantiq
                    </div>

                    <div className="text-[10px] sm:text-xs text-slate-500">
                      Natija yopilgan
                    </div>

                  </div>

                  <span className="text-sm">
                    🔒
                  </span>

                </div>

              </div>

              {/* ANALOGIYA */}

              <div className="bg-slate-800 rounded-lg px-3 py-2.5">

                <div className="flex items-center gap-2">

                  <span className="text-lg">
                    🔗
                  </span>

                  <div className="flex-1 min-w-0">

                    <div className="font-semibold text-xs sm:text-sm">
                      Analogiya
                    </div>

                    <div className="text-[10px] sm:text-xs text-slate-500">
                      Natija yopilgan
                    </div>

                  </div>

                  <span className="text-sm">
                    🔒
                  </span>

                </div>

              </div>

              {/* MANTIQIY XULOSA */}

              <div className="bg-slate-800 rounded-lg px-3 py-2.5">

                <div className="flex items-center gap-2">

                  <span className="text-lg">
                    🧠
                  </span>

                  <div className="flex-1 min-w-0">

                    <div className="font-semibold text-xs sm:text-sm">
                      Mantiqiy xulosa
                    </div>

                    <div className="text-[10px] sm:text-xs text-slate-500">
                      Natija yopilgan
                    </div>

                  </div>

                  <span className="text-sm">
                    🔒
                  </span>

                </div>

              </div>

              {/* MURAKKAB KETMA-KETLIK */}

              <div className="bg-slate-800 rounded-lg px-3 py-2.5">

                <div className="flex items-center gap-2">

                  <span className="text-lg">
                    📈
                  </span>

                  <div className="flex-1 min-w-0">

                    <div className="font-semibold text-xs sm:text-sm">
                      Murakkab ketma-ketlik
                    </div>

                    <div className="text-[10px] sm:text-xs text-slate-500">
                      Natija yopilgan
                    </div>

                  </div>

                  <span className="text-sm">
                    🔒
                  </span>

                </div>

              </div>

              {/* ADVANCED VIZUAL */}

              <div className="bg-slate-800 rounded-lg px-3 py-2.5">

                <div className="flex items-center gap-2">

                  <span className="text-lg">
                    🔷
                  </span>

                  <div className="flex-1 min-w-0">

                    <div className="font-semibold text-xs sm:text-sm">
                      Advanced vizual
                    </div>

                    <div className="text-[10px] sm:text-xs text-slate-500">
                      Natija yopilgan
                    </div>

                  </div>

                  <span className="text-sm">
                    🔒
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* =========================
              PREMIUM VALUE
          ========================= */}

          <div className="bg-slate-800/70 rounded-2xl p-4 sm:p-5 mb-4">

            <div className="text-blue-400 text-xs font-bold mb-1.5">
              PREMIUM NATIJA
            </div>

            <h2 className="text-lg sm:text-xl font-bold mb-3">
              Natijangizni to‘liq oching
            </h2>

            <div className="space-y-2 text-slate-300 text-xs sm:text-sm">

              <div className="flex gap-2">
                <span>✓</span>
                <span>
                  6 ta yo‘nalish bo‘yicha batafsil natija
                </span>
              </div>

              <div className="flex gap-2">
                <span>✓</span>
                <span>
                  Qaysi yo‘nalishda kuchli ekaningiz
                </span>
              </div>

              <div className="flex gap-2">
                <span>✓</span>
                <span>
                  Platforma ishtirokchilari orasidagi percentile
                </span>
              </div>

              <div className="flex gap-2">
                <span>✓</span>
                <span>
                  Xato qilingan savollar bo‘yicha tahlil
                </span>
              </div>

              <div className="flex gap-2">
                <span>✓</span>
                <span>
                  Natijani ulashish uchun maxsus karta
                </span>
              </div>

            </div>

          </div>

          {/* =========================
              PRICE
          ========================= */}

          <div className="text-center mb-3.5">

            <div className="text-slate-400 text-xs">
              Batafsil natijani ochish
            </div>

            <div className="text-3xl font-bold mt-0.5">
              7 900 so‘m
            </div>

            <div className="text-slate-500 text-[11px] mt-1">
              Bir martalik to‘lov
            </div>

          </div>

          {/* =========================
              PAYMENT BUTTON
          ========================= */}

          <button
            onClick={() => router.push("/premium")}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 py-3.5 rounded-xl font-bold text-sm sm:text-base transition"
          >
            🔓 Batafsil natijani ochish
          </button>

          {/* =========================
              RETEST
          ========================= */}

          <button
            onClick={() => router.push("/test")}
            className="w-full mt-2 text-slate-400 hover:text-white py-2.5 transition text-xs sm:text-sm"
          >
            ↻ Testni qayta ishlash
          </button>

        </div>

      </div>
    </main>
  );
}