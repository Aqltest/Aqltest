"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ResultData = {
  score: number;
  total: number;
  percentage: number;
  timeUsed: number;
  answers: (string | null)[];
};

export default function ResultPage() {
  const router = useRouter();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const attemptId = localStorage.getItem(
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
          console.error("Natija olinmadi:", data);
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
      <main className="min-h-screen bg-slate-950 text-white p-3 sm:p-4 md:p-6">
        <div className="text-center">
          <div className="text-5xl mb-5">🧠</div>

          <h1 className="text-2xl font-bold">
            Natija yuklanmoqda...
          </h1>

          <p className="text-slate-400 mt-2">
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
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-5">
            🧠
          </div>

          <h1 className="text-2xl font-bold mb-3">
            Natija topilmadi
          </h1>

          <p className="text-slate-400 mb-6">
            Avval IQ testni ishlab ko‘ring.
          </p>

          <button
            onClick={() => router.push("/test")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition"
          >
            IQ TESTNI BOSHLASH
          </button>
        </div>
      </main>
    );
  }

  const minutes = Math.floor(
    result.timeUsed / 60
  );

  const seconds = result.timeUsed % 60;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-6">

      <div className="w-full max-w-lg mx-auto py-3 sm:py-6 md:py-10">

        <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">

          {/* HEADER */}

           <div className="text-center mb-5 sm:mb-8">

            <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4">
  🧠
</div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
               Test yakunlandi!
            </h1>

            <p className="text-slate-400 mt-3">
              Natijangiz tayyor.
            </p>

          </div>

          {/* MAIN RESULT */}

          <div className="bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 text-center mb-4 sm:mb-5">

            <div className="text-slate-400 text-sm mb-2">
              Umumiy natijangiz
            </div>

            <div className="text-5xl sm:text-6xl font-bold text-blue-400">
  {result.percentage}%
</div>

            <div className="text-slate-300 mt-3">
              {result.score} / {result.total} ta to‘g‘ri javob
            </div>

          </div>

          {/* QUICK STATS */}

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">

            <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">

              <div className="text-slate-400 text-sm">
                Sarflangan vaqt
              </div>

              <div className="text-xl font-bold mt-1">
                {minutes}:
                {String(seconds).padStart(2, "0")}
              </div>

            </div>

            <div className="bg-slate-800 rounded-2xl p-4 text-center">

              <div className="text-slate-400 text-sm">
                Savollar
              </div>

              <div className="text-xl font-bold mt-1">
                {result.total}
              </div>

            </div>

          </div>

          {/* SHORT PREVIEW */}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">

            <div className="text-blue-400 text-sm font-semibold mb-2">
              NATIJANGIZ HAQIDA
            </div>

            <p className="text-slate-300 leading-relaxed">
              Siz testdagi {result.total} ta savolning{" "}
              <span className="font-bold text-white">
                {result.score} tasiga
              </span>{" "}
              to‘g‘ri javob berdingiz.
            </p>

            <p className="text-slate-400 text-sm mt-3">
              Batafsil tahlilda natijangizning turli
              yo‘nalishlar bo‘yicha qanday taqsimlanganini
              ko‘rishingiz mumkin.
            </p>

          </div>

          {/* LOCKED ANALYSIS */}

          <div className="mb-5 sm:mb-7">

            <h2 className="text-xl font-bold mb-4">
              🔒 Batafsil tahlil
            </h2>

            <div className="space-y-3">

              <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🧮</div>

                  <div className="flex-1">
                    <div className="font-semibold">
                      Sonli mantiq
                    </div>

                    <div className="text-sm text-slate-500">
                      Natija yopilgan
                    </div>
                  </div>

                  <div className="text-xl">🔒</div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🧩</div>

                  <div className="flex-1">
                    <div className="font-semibold">
                      Vizual mantiq
                    </div>

                    <div className="text-sm text-slate-500">
                      Natija yopilgan
                    </div>
                  </div>

                  <div className="text-xl">🔒</div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔗</div>

                  <div className="flex-1">
                    <div className="font-semibold">
                      Analogiya
                    </div>

                    <div className="text-sm text-slate-500">
                      Natija yopilgan
                    </div>
                  </div>

                  <div className="text-xl">🔒</div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🧠</div>

                  <div className="flex-1">
                    <div className="font-semibold">
                      Mantiqiy xulosa
                    </div>

                    <div className="text-sm text-slate-500">
                      Natija yopilgan
                    </div>
                  </div>

                  <div className="text-xl">🔒</div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📈</div>

                  <div className="flex-1">
                    <div className="font-semibold">
                      Murakkab ketma-ketlik
                    </div>

                    <div className="text-sm text-slate-500">
                      Natija yopilgan
                    </div>
                  </div>

                  <div className="text-xl">🔒</div>
                </div>
              </div>

            </div>

          </div>

          {/* PREMIUM VALUE */}

          <div className="bg-slate-800/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6">

            <div className="text-blue-400 text-sm font-bold mb-2">
              PREMIUM NATIJA
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5">
              Natijangizni to‘liq oching
            </h2>

            <div className="space-y-4 text-slate-300">

              <div className="flex gap-3">
                <span>✓</span>
                <span>
                  6 ta yo‘nalish bo‘yicha batafsil natija
                </span>
              </div>

              <div className="flex gap-3">
                <span>✓</span>
                <span>
                  Qaysi yo‘nalishda kuchli ekaningiz
                </span>
              </div>

              <div className="flex gap-3">
                <span>✓</span>
                <span>
                  Platforma ishtirokchilari orasidagi percentile
                </span>
              </div>

              <div className="flex gap-3">
                <span>✓</span>
                <span>
                  Xato qilingan savollar bo‘yicha tahlil
                </span>
              </div>

              <div className="flex gap-3">
                <span>✓</span>
                <span>
                  Natijani ulashish uchun maxsus karta
                </span>
              </div>

            </div>

          </div>

          {/* PRICE */}

          <div className="text-center mb-5">

            <div className="text-slate-400 text-sm">
              Batafsil natijani ochish
            </div>

            <div className="text-3xl sm:text-4xl font-bold mt-1">
               7 900 so‘m
            </div>

            <div className="text-slate-500 text-sm mt-2">
              Bir martalik to‘lov
            </div>

          </div>

          {/* PAYMENT BUTTON */}

          <button
            onClick={() => router.push("/premium")}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 py-4 rounded-xl font-bold text-lg transition"
          >
            🔓 Batafsil natijani ochish
          </button>

          {/* RETEST */}

          <button
            onClick={() => router.push("/test")}
            className="w-full mt-4 text-slate-400 hover:text-white py-3 transition"
          >
            ↻ Testni qayta ishlash
          </button>

        </div>
      </div>
    </main>
  );
}