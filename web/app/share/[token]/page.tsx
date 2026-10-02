import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { answerKey } from "@/app/api/attempt/answer-key";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

const sections = [
  {
    name: "Sonli mantiq",
    start: 0,
    end: 3,
    icon: "🧮",
  },
  {
    name: "Vizual mantiq",
    start: 4,
    end: 7,
    icon: "🧩",
  },
  {
    name: "Analogiya",
    start: 8,
    end: 11,
    icon: "🔗",
  },
  {
    name: "Mantiqiy xulosa",
    start: 12,
    end: 15,
    icon: "🧠",
  },
  {
    name: "Murakkab ketma-ketlik",
    start: 16,
    end: 19,
    icon: "📊",
  },
  {
    name: "Advanced vizual",
    start: 20,
    end: 23,
    icon: "🔷",
  },
];

export default async function SharePage({
  params,
}: PageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  const { data: attempt, error } =
    await supabaseAdmin
      .from("attempts")
      .select(
        "id, display_name, weighted_score, score, total, time_used, answers, is_premium, share_token"
      )
      .eq("share_token", token)
      .eq("is_premium", true)
      .maybeSingle();

  if (error) {
    console.error(
      "Share page query error:",
      error
    );

    notFound();
  }

  if (!attempt) {
    notFound();
  }

  const answers = Array.isArray(
    attempt.answers
  )
    ? attempt.answers
    : [];

  // =========================================================
  // STRONGEST SECTION
  // =========================================================

  const sectionResults = sections.map(
    (section) => {
      let score = 0;

      for (
        let i = section.start;
        i <= section.end;
        i++
      ) {
        if (
          answers[i] === answerKey[i]
        ) {
          score++;
        }
      }

      return {
        name: section.name,
        icon: section.icon,
        score,
      };
    }
  );

  const strongestSection =
    [...sectionResults].sort(
      (a, b) => b.score - a.score
    )[0];

  // =========================================================
  // TIME
  // =========================================================

  const minutes = Math.floor(
    (attempt.time_used ?? 0) / 60
  );

  const seconds =
    (attempt.time_used ?? 0) % 60;

  const formattedTime =
    `${minutes}:${String(
      seconds
    ).padStart(2, "0")}`;

  const displayName =
    attempt.display_name?.trim() ||
    "AqlTest foydalanuvchisi";

  const score =
    Number(
      attempt.weighted_score ?? 0
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white px-3 py-6 sm:px-4 sm:py-10">

      <div className="w-full max-w-md mx-auto">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="text-center mb-6">

          <div className="text-5xl mb-3">
            🧠
          </div>

          <div className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">
            AQLTEST
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mt-2">
            Test natijasi
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Premium foydalanuvchi natijasi
          </p>

        </div>

        {/* ===================================================
            SCORE CARD
        =================================================== */}

        <div className="bg-slate-900 rounded-3xl p-5 sm:p-6">

          <div className="text-center">

            <p className="text-slate-400 text-xs uppercase tracking-wide">
              AqlTest Score
            </p>

            <div className="text-7xl sm:text-8xl font-bold text-blue-400 leading-none mt-3">
              {score}
            </div>

            <p className="text-slate-500 text-xs mt-2">
              100 ballik tizim
            </p>

          </div>

          {/* NAME */}

          <div className="border-t border-slate-800 mt-6 pt-5 text-center">

            <p className="text-slate-500 text-xs">
              Natija egasi
            </p>

            <p className="text-lg sm:text-xl font-bold mt-1">
              {displayName}
            </p>

          </div>

          {/* QUICK INFO */}

          <div className="grid grid-cols-2 gap-2 mt-5">

            <div className="bg-slate-800 rounded-xl p-3 text-center">

              <div className="text-slate-500 text-[11px]">
                To‘g‘ri javoblar
              </div>

              <div className="font-bold mt-1">
                {attempt.score}/
                {attempt.total}
              </div>

            </div>

            <div className="bg-slate-800 rounded-xl p-3 text-center">

              <div className="text-slate-500 text-[11px]">
                Sarflangan vaqt
              </div>

              <div className="font-bold mt-1">
                {formattedTime}
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            STRONGEST SECTION
        =================================================== */}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 mt-4">

          <p className="text-blue-400 text-xs font-bold uppercase tracking-wide">
            💪 Kuchli yo‘nalish
          </p>

          <p className="text-xl sm:text-2xl font-bold mt-2">
            {strongestSection.icon}{" "}
            {strongestSection.name}
          </p>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-3">
            Ushbu test natijasiga ko‘ra,
            ushbu yo‘nalishdagi topshiriqlarda
            yaxshi natija ko‘rsatildi.
          </p>

        </div>

        {/* ===================================================
            PREMIUM BADGE
        =================================================== */}

        <div className="bg-slate-900 rounded-2xl p-4 mt-4 text-center">

          <div className="text-2xl mb-2">
            💎
          </div>

          <p className="font-bold">
            Premium natija
          </p>

          <p className="text-slate-500 text-xs mt-1">
            AqlTest premium tahlili asosida
          </p>

        </div>

        {/* ===================================================
            CTA
        =================================================== */}

        <Link
          href="/test"
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 py-4 rounded-xl font-bold mt-4 transition"
        >
          🧠 O‘ZIMNI SINAB KO‘RISH
        </Link>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <p className="text-center text-slate-600 text-[11px] mt-5">
          AqlTest — mantiqiy fikrlash testi
        </p>

      </div>

    </main>
  );
}