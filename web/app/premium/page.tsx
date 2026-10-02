"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ResultData = {
  score: number;
  total: number;
  percentage: number;
  weightedScore: number;
  timeUsed: number;
  answers: (string | null)[];
  certificateId: string | null;
  shareUrl: string | null;
};

type SectionResult = {
  name: string;
  icon: string;
  score: number;
  total: number;
  percentage: number;
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

export default function PremiumPage() {
  const router = useRouter();

  const [result, setResult] = useState<ResultData | null>(null);

  const [sections, setSections] = useState<SectionResult[]>([]);

  const [strongestSection, setStrongestSection] =
    useState<SectionResult | null>(null);

  const [name, setName] = useState("");

  const [downloading, setDownloading] = useState(false);

  const [loading, setLoading] = useState(true);

  const certificateRef = useRef<HTMLDivElement>(null);

  // =========================================================
  // LOAD PREMIUM RESULT FROM SERVER
  // =========================================================

  useEffect(() => {
    async function loadPremiumResult() {
      try {
        const attemptId = localStorage.getItem("aqltest_attempt_id");

        if (!attemptId) {
          router.push("/result");
          return;
        }

        const response = await fetch(
          `/api/attempt/premium?id=${attemptId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error(
            "Premium natija olinmadi:",
            data
          );

          router.push("/result");
          return;
        }

        const attempt = data.attempt;

        setResult({
          score: attempt.score,
          total: attempt.total,
          percentage: attempt.percentage,
          weightedScore:
            attempt.weightedScore ?? attempt.percentage,
          timeUsed: attempt.timeUsed,
          answers: attempt.answers,
          certificateId: attempt.certificateId ?? null,
          shareUrl: attempt.shareUrl ?? null,
        });

        setSections(data.sections ?? []);

        setStrongestSection(
          data.strongestSection ?? null
        );
      } catch (error) {
        console.error(
          "Premium natijani olishda xatolik:",
          error
        );

        router.push("/result");
      } finally {
        setLoading(false);
      }
    }

    loadPremiumResult();

    const savedName =
      localStorage.getItem("aqltest_name");

    if (savedName) {
      setName(savedName);
    }
  }, [router]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">
            🧠
          </div>

          <p className="text-slate-400">
            Natija yuklanmoqda...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // RESULT NOT FOUND
  // =========================================================

  if (!result || !strongestSection) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">
            🧠
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            Premium natija topilmadi
          </h1>

          <p className="text-slate-400 text-sm mb-5">
            Premium natijani ko‘rish uchun avval test natijangizni oching.
          </p>

          <button
            onClick={() => router.push("/result")}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-bold transition"
          >
            ← Natijaga qaytish
          </button>
        </div>
      </main>
    );
  }

  // =========================================================
  // SECOND STRONGEST SECTION
  // =========================================================

  const sortedSections = [...sections].sort(
    (a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }

      return b.score - a.score;
    }
  );

  const secondStrongestSection =
    sortedSections.find(
      (section) =>
        section.name !== strongestSection.name
    ) ?? null;

  // =========================================================
  // TIME
  // =========================================================

  const minutes = Math.floor(
    result.timeUsed / 60
  );

  const seconds = result.timeUsed % 60;

  const formattedTime = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // =========================================================
  // SAVE NAME
  // =========================================================

  function handleNameChange(value: string) {
    setName(value);

    localStorage.setItem(
      "aqltest_name",
      value
    );
  }

  // =========================================================
  // CERTIFICATE ID
  // =========================================================

  const certificateId =
    result.certificateId ??
    "Sertifikat ID mavjud emas";

  // =========================================================
  // SHARE RESULT
  // =========================================================

  async function shareResult() {
  const shareUrl = result?.shareUrl;
  const strongestName =
    strongestSection?.name ?? "AqlTest natijasi";

  if (!shareUrl) {
    alert(
      "Ulashish havolasi hali mavjud emas."
    );
    return;
  }

  const shareText =
    `🧠 AqlTest natijam\n\n` +
    `AqlTest Score: ${result?.weightedScore ?? 0}/100\n` +
    `Kuchli yo'nalish: ${strongestName}\n\n` +
    `Natijani ko'rish: ${shareUrl}`;

  try {
    const telegram =
      (window as any).Telegram?.WebApp;

    if (
      telegram &&
      typeof telegram.openTelegramLink ===
        "function"
    ) {
      const telegramShareUrl =
        `https://t.me/share/url?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(
          shareText
        )}`;

      telegram.openTelegramLink(
        telegramShareUrl
      );

      return;
    }

    if (
      navigator.share &&
      typeof navigator.share ===
        "function"
    ) {
      await navigator.share({
        title: "AqlTest natijam",
        text: shareText,
        url: shareUrl,
      });

      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        shareText
      );

      alert(
        "Natija havolasi nusxalandi."
      );
    }
  } catch (error) {
    console.error(
      "Ulashishda xatolik:",
      error
    );
  }
}

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  async function downloadCertificate() {
    if (!name.trim()) {
      alert(
        "Iltimos, avval ismingizni kiriting."
      );

      return;
    }

    if (!certificateRef.current) {
      alert(
        "Sertifikat tayyor emas."
      );

      return;
    }

    setDownloading(true);

    try {
      const canvas =
        await html2canvas(
          certificateRef.current,
          {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
          }
        );

      const imageData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 297;
      const pageHeight = 210;

      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight
      );

      pdf.save(
        `AqlTest-Sertifikat-${name
          .trim()
          .replace(/\s+/g, "-")}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF xatoligi:",
        error
      );

      alert(
        "PDF yaratishda xatolik yuz berdi."
      );
    } finally {
      setDownloading(false);
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            🧠
          </div>

          <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">
            Premium natija
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Batafsil natijangiz
          </h1>

          <p className="text-slate-400 mt-2">
            Test natijangiz to‘liq tahlil qilindi.
          </p>
        </div>

        {/* ================================================= */}
        {/* MAIN RESULT */}
        {/* ================================================= */}

        <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 mb-5">

          <div className="bg-slate-800 rounded-xl p-5 sm:p-6 text-center">

            <p className="text-sm text-slate-400">
              AqlTest Score
            </p>

            <div className="text-5xl sm:text-6xl font-bold text-blue-400 mt-2">
              {result.weightedScore}
            </div>

            <p className="text-slate-500 text-[11px] sm:text-xs mt-1">
              100 ballik tizim
            </p>

            <p className="text-sm text-slate-300 mt-3">
              {result.score}/{result.total} ta to‘g‘ri javob
            </p>

          </div>

          <div className="bg-slate-800 rounded-xl p-4 mt-4">

            <p className="text-xs text-slate-400">
              Testni bajarish vaqti
            </p>

            <p className="text-xl font-bold mt-1">
              {formattedTime}
            </p>

          </div>

        </div>

        {/* ================================================= */}
        {/* STRONGEST SECTION */}
        {/* ================================================= */}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 sm:p-6 mb-5">

          <p className="text-sm text-blue-400 font-medium">
            Sizning kuchli yo‘nalishingiz
          </p>

          <p className="text-xl sm:text-2xl font-bold mt-2">
            {strongestSection.icon}{" "}
            {strongestSection.name}
          </p>

          <p className="text-slate-300 text-sm mt-3 leading-6">
            {sectionDescriptions[
              strongestSection.name
            ] ??
              "Ushbu yo‘nalishda test davomida yuqori natija ko‘rsatgansiz."}
          </p>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">

            <p className="text-xs text-slate-500">
              Bu nimani anglatadi?
            </p>

            <p className="text-sm text-slate-300 mt-1 leading-5">
              Ushbu natija testdagi shu yo‘nalish
              bo‘yicha nisbatan kuchliroq ishlaganingizni
              ko‘rsatadi. Bu klinik yoki ilmiy
              psixologik tashxis emas.
            </p>

          </div>

        </div>

        {/* ================================================= */}
        {/* SECOND STRONGEST */}
        {/* ================================================= */}

        {secondStrongestSection && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">

            <p className="text-sm text-slate-400">
              Keyingi kuchli yo‘nalishingiz
            </p>

            <p className="text-lg font-bold mt-2">
              {secondStrongestSection.icon}{" "}
              {secondStrongestSection.name}
            </p>

            <p className="text-slate-400 text-sm mt-2 leading-5">
              {sectionDescriptions[
                secondStrongestSection.name
              ] ??
                "Ushbu yo‘nalish bo‘yicha ham yaxshi natija qayd etilgansiz."}
            </p>

          </div>
        )}

        {/* ================================================= */}
        {/* SECTION RESULTS */}
        {/* ================================================= */}

        <div className="mb-5 sm:mb-6">

          <h2 className="font-bold text-base sm:text-lg mb-3">
            📊 Yo‘nalishlar bo‘yicha natija
          </h2>

          <div className="space-y-2">

            {sections.map(
              (section) => (
                <div
                  key={section.name}
                  className="bg-slate-800 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3"
                >

                  <div className="flex justify-between items-center mb-1.5">

                    <div className="flex items-center gap-2 min-w-0">

                      <span className="text-lg sm:text-xl shrink-0">
                        {section.icon}
                      </span>

                      <span className="font-semibold text-sm sm:text-base truncate">
                        {section.name}
                      </span>

                    </div>

                    <span className="text-xs sm:text-sm font-bold ml-2 shrink-0">
                      {section.score}/
                      {section.total}
                    </span>

                  </div>

                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            section.percentage
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* PREMIUM BENEFITS */}
        {/* ================================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-5">

          <h2 className="font-bold text-lg mb-4">
            💎 Premium imkoniyatlari
          </h2>

          <div className="space-y-2 text-slate-300 text-sm">

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
                AqlTest reytingida qatnashish
              </span>
            </div>

            <div className="flex gap-2">
              <span>✓</span>
              <span>
                PDF sertifikat olish
              </span>
            </div>

            <div className="flex gap-2">
              <span>✓</span>
              <span>
                Natijani ulashish
              </span>
            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* SHARE */}
        {/* ================================================= */}

        <button
          onClick={shareResult}
          disabled={!result.shareUrl}
          className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg transition ${
            result.shareUrl
              ? "bg-slate-800 hover:bg-slate-700 active:bg-slate-600"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }`}
        >
          🔗 Natijani ulashish
        </button>

        {/* ================================================= */}
        {/* CERTIFICATE */}
        {/* ================================================= */}

        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 mt-5">

          <div className="text-center mb-5">

            <div className="text-4xl mb-2">
              🏆
            </div>

            <h2 className="text-2xl font-bold">
              Sertifikatingiz
            </h2>

            <p className="text-slate-400 text-sm mt-2 leading-5">
              Natijangizni A4 formatdagi PDF
              sertifikat sifatida saqlang.
            </p>

          </div>

          {/* NAME */}

          <label className="block text-sm text-slate-300 mb-2">
            Sertifikatda ko‘rsatiladigan ism
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              handleNameChange(
                e.target.value
              )
            }
            placeholder="Ism Familiya"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 outline-none focus:border-blue-500 transition mb-4"
          />

          <button
            onClick={downloadCertificate}
            disabled={
              downloading ||
              !name.trim()
            }
            className={`
              w-full py-4 rounded-xl font-bold text-base sm:text-lg transition
              ${
                downloading ||
                !name.trim()
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }
            `}
          >
            {downloading
              ? "⏳ PDF tayyorlanmoqda..."
              : "🏆 Sertifikatni PDF qilib yuklab olish"}
          </button>

        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

          <button
            onClick={() =>
              router.push("/ranking")
            }
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-semibold"
          >
            🏆 Reyting
          </button>

          <button
            onClick={() =>
              router.push("/result")
            }
            className="w-full py-3 rounded-xl text-slate-400 hover:text-white transition font-semibold"
          >
            ← Natijaga qaytish
          </button>

        </div>

      </div>

      {/* =====================================================
          HIDDEN CERTIFICATE
      ===================================================== */}

      <div
        ref={certificateRef}
        style={{
          position: "fixed",
          left: "-10000px",
          top: "0",
          width: "1123px",
          height: "794px",
          background: "#ffffff",
          color: "#111827",
          fontFamily: "Arial, sans-serif",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            width: "100%",
            height: "100%",
            padding: "45px",
            boxSizing: "border-box",
            background: "#ffffff",
          }}
        >

          <div
            style={{
              width: "100%",
              height: "100%",
              border: "8px solid #1d4ed8",
              boxSizing: "border-box",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >

            {/* TOP */}

            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                letterSpacing: "5px",
                color: "#1d4ed8",
                marginBottom: "12px",
              }}
            >
              AQLTEST
            </div>

            <div
              style={{
                fontSize: "18px",
                letterSpacing: "4px",
                color: "#64748b",
                marginBottom: "35px",
              }}
            >
              TEST NATIJA SERTIFIKATI
            </div>

            {/* NAME */}

            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "20px",
              }}
            >
              {name || "Ism Familiya"}
            </div>

            <div
              style={{
                width: "500px",
                height: "2px",
                background: "#cbd5e1",
                marginBottom: "20px",
              }}
            />

            <div
              style={{
                fontSize: "18px",
                color: "#475569",
                marginBottom: "28px",
              }}
            >
              AqlTest testini muvaffaqiyatli yakunladi
            </div>

            {/* SCORE */}

            <div
              style={{
                display: "flex",
                gap: "70px",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "35px",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  AqlTest Score
                </div>

                <div
                  style={{
                    fontSize: "46px",
                    fontWeight: "bold",
                    color: "#1d4ed8",
                  }}
                >
                  {result.weightedScore}
                </div>

              </div>

              <div>

                <div
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  To‘g‘ri javoblar
                </div>

                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                >
                  {result.score}/
                  {result.total}
                </div>

              </div>

              <div>

                <div
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  Vaqt
                </div>

                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                >
                  {formattedTime}
                </div>

              </div>

            </div>

            {/* STRONGEST SECTION */}

            <div
              style={{
                fontSize: "17px",
                color: "#334155",
                marginBottom: "20px",
              }}
            >
              Kuchli yo‘nalish:{" "}
              <strong>
                {strongestSection.name}
              </strong>
            </div>

            {/* FOOTER */}

            <div
              style={{
                position: "absolute",
                bottom: "35px",
                left: "50px",
                right: "50px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                fontSize: "13px",
                color: "#64748b",
              }}
            >

              <div
                style={{
                  textAlign: "left",
                }}
              >

                <div>
                  Sertifikat ID
                </div>

                <strong
                  style={{
                    color: "#334155",
                  }}
                >
                  {certificateId}
                </strong>

              </div>

              <div>
                AqlTest
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >

                <div>
                  24 ta savol
                </div>

                <div>
                  12 daqiqalik test
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}