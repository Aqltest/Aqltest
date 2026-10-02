"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RankingUser = {
  rank: number;
  displayName: string;
  score: number;
};

export default function RankingPage() {
  const router = useRouter();

  const [ranking, setRanking] =
    useState<RankingUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadRanking() {
      try {
        const response = await fetch(
          "/api/ranking"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(
            data.error ||
              "Reytingni yuklashda xatolik yuz berdi."
          );

          return;
        }

        setRanking(data.ranking ?? []);
      } catch (error) {
        console.error(
          "Ranking load error:",
          error
        );

        setError(
          "Server bilan bog‘lanishda xatolik."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRanking();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">

          <div className="text-5xl mb-3">
            🏆
          </div>

          <h1 className="text-xl font-bold">
            Reyting yuklanmoqda...
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Eng yaxshi natijalar olinmoqda.
          </p>

        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6 text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-xl font-bold mb-2">
            Reyting yuklanmadi
          </h1>

          <p className="text-slate-400 text-sm mb-5">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition"
          >
            Qayta urinish
          </button>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-3 py-5 sm:px-4 sm:py-8">

      <div className="w-full max-w-lg mx-auto">

        {/* =========================
            HEADER
        ========================= */}

        <div className="text-center mb-6">

          <div className="text-5xl mb-2">
            🏆
          </div>

          <div className="text-blue-400 text-xs font-bold uppercase tracking-widest">
            AqlTest
          </div>

          <h1 className="text-3xl font-bold mt-1">
            Reyting
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Eng yuqori AqlTest Score natijalari
          </p>

        </div>

        {/* =========================
            EMPTY
        ========================= */}

        {ranking.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-6 text-center">

            <div className="text-4xl mb-3">
              🧠
            </div>

            <h2 className="text-lg font-bold">
              Hozircha reyting bo‘sh
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              Premium natijalardan keyin
              foydalanuvchilar shu yerda ko‘rinadi.
            </p>

          </div>
        ) : (
          <>
            {/* =========================
                TOP 3
            ========================= */}

            {ranking.length >= 3 && (
              <div className="grid grid-cols-3 gap-2 mb-5">

                {/* SECOND */}

                <div className="bg-slate-900 rounded-2xl p-3 text-center mt-5">

                  <div className="text-3xl">
                    🥈
                  </div>

                  <div className="text-xs font-bold mt-2 truncate">
                    {ranking[1].displayName}
                  </div>

                  <div className="text-xl font-bold text-blue-400 mt-1">
                    {ranking[1].score}
                  </div>

                  <div className="text-[10px] text-slate-500">
                    Score
                  </div>

                </div>

                {/* FIRST */}

                <div className="bg-slate-800 border border-blue-500/30 rounded-2xl p-3 text-center">

                  <div className="text-4xl">
                    🥇
                  </div>

                  <div className="text-xs font-bold mt-2 truncate">
                    {ranking[0].displayName}
                  </div>

                  <div className="text-2xl font-bold text-blue-400 mt-1">
                    {ranking[0].score}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    AqlTest Score
                  </div>

                </div>

                {/* THIRD */}

                <div className="bg-slate-900 rounded-2xl p-3 text-center mt-5">

                  <div className="text-3xl">
                    🥉
                  </div>

                  <div className="text-xs font-bold mt-2 truncate">
                    {ranking[2].displayName}
                  </div>

                  <div className="text-xl font-bold text-blue-400 mt-1">
                    {ranking[2].score}
                  </div>

                  <div className="text-[10px] text-slate-500">
                    Score
                  </div>

                </div>

              </div>
            )}

            {/* =========================
                FULL RANKING
            ========================= */}

            <div className="bg-slate-900 rounded-2xl p-3 sm:p-4">

              <div className="flex items-center justify-between px-2 mb-3">

                <h2 className="font-bold text-sm sm:text-base">
                  🏆 TOP 100
                </h2>

                <span className="text-xs text-slate-500">
                  {ranking.length} ta
                </span>

              </div>

              <div className="space-y-1.5">

                {ranking.map((user) => {

                  const isTopThree =
                    user.rank <= 3;

                  return (
                    <div
                      key={`${user.rank}-${user.displayName}`}
                      className={`
                        flex items-center gap-3
                        rounded-xl px-3 py-2.5
                        ${
                          isTopThree
                            ? "bg-slate-800"
                            : "bg-slate-950/50"
                        }
                      `}
                    >

                      <div className="w-8 text-center font-bold text-sm">

                        {user.rank === 1
                          ? "🥇"
                          : user.rank === 2
                          ? "🥈"
                          : user.rank === 3
                          ? "🥉"
                          : `${user.rank}`}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="font-semibold text-sm truncate">
                          {user.displayName}
                        </div>

                      </div>

                      <div className="text-blue-400 font-bold text-sm">
                        {user.score}
                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          </>
        )}

        {/* =========================
            INFO
        ========================= */}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">

          <div className="text-blue-400 text-xs font-bold mb-1">
            ℹ️ REYTING QOIDASI
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            Reytingda faqat premium natijalar
            hisobga olinadi. Har bir foydalanuvchining
            eng yuqori AqlTest Score natijasi
            ko‘rsatiladi.
          </p>

        </div>

        {/* =========================
            BACK
        ========================= */}

        <button
          onClick={() => router.push("/")}
          className="w-full mt-4 py-3 text-slate-400 hover:text-white transition text-sm"
        >
          ← Bosh sahifaga qaytish
        </button>

      </div>

    </main>
  );
}