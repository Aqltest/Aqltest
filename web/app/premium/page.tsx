"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ResultData = {
  score: number;
  total: number;
  percentage: number;
  timeUsed: number;
  answers: (string | null)[];
};

type SectionResult = {
  name: string;
  icon: string;
  score: number;
  total: number;
  percentage: number;
};

export default function PremiumPage() {
  const router = useRouter();

  const [result, setResult] =
    useState<ResultData | null>(null);

  const [sections, setSections] =
    useState<SectionResult[]>([]);

  const [strongestSection, setStrongestSection] =
    useState<SectionResult | null>(null);

  const [name, setName] = useState("");

  const [downloading, setDownloading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const certificateRef =
    useRef<HTMLDivElement>(null);

  // =========================================================
  // LOAD PREMIUM RESULT FROM SERVER
  // =========================================================

  useEffect(() => {
    async function loadPremiumResult() {
      try {
        const attemptId =
          localStorage.getItem(
            "aqltest_attempt_id"
          );

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
          timeUsed: attempt.timeUsed,
          answers: attempt.answers,
        });

        setSections(data.sections);

        setStrongestSection(
          data.strongestSection
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

  if (loading || !result || !strongestSection) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">
          Natija yuklanmoqda...
        </p>
      </main>
    );
  }

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
    localStorage.getItem(
      "aqltest_certificate_id"
    ) ||
    `AQL-${Date.now()
      .toString()
      .slice(-8)}`;

  localStorage.setItem(
    "aqltest_certificate_id",
    certificateId
  );

  // =========================================================
  // DATE
  // =========================================================

  const certificateDate =
    new Date().toLocaleDateString(
      "uz-UZ",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

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

    if (!certificateRef.current) return;

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
      console.error(error);

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

        {/* HEADER */}

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
            Test natijangiz to'liq tahlil qilindi.
          </p>

        </div>

        {/* MAIN RESULT */}

        <div className="bg-slate-900 rounded-2xl p-6 mb-5">

          <div className="bg-slate-800 rounded-xl p-6 text-center">

            <p className="text-sm text-slate-400">
              Umumiy natija
            </p>

            <div className="text-5xl font-bold text-blue-400 mt-2">
              {result.percentage}%
            </div>

            <p className="text-sm text-slate-300 mt-2">
              {result.score}/{result.total} ta to'g'ri javob
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

        {/* SECTION RESULTS */}

<div className="mb-5 sm:mb-6">

  <h2 className="font-bold text-base sm:text-lg mb-3">
    📊 Yo'nalishlar bo'yicha natija
  </h2>

  <div className="space-y-2">

    {sections.map((section) => {
      return (
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
              {section.score}/{section.total}
            </span>

          </div>

          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">

            <div
              className="h-full bg-blue-500 transition-all"
              style={{
                width: `${section.percentage}%`,
              }}
            />

          </div>

        </div>
      );
    })}

  </div>

</div>

        {/* STRONGEST SECTION */}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 mb-6">

          <p className="text-sm text-blue-400">
            Kuchli yo'nalishingiz
          </p>

          <p className="text-xl font-bold mt-1">
            {strongestSection.icon}{" "}
            {strongestSection.name}
          </p>

        </div>

        {/* CERTIFICATE */}

        <div className="bg-slate-900 rounded-2xl p-6">

          <div className="text-center mb-5">

            <div className="text-4xl mb-2">
              🏆
            </div>

            <h2 className="text-2xl font-bold">
              Sertifikatingiz
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              Natijangizni A4 formatdagi PDF
              sertifikat sifatida saqlang.
            </p>

          </div>

          {/* NAME */}

          <label className="block text-sm text-slate-300 mb-2">
            Sertifikatda ko'rsatiladigan ism
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
              w-full py-4 rounded-xl font-bold text-lg transition
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

        {/* BACK */}

        <button
          onClick={() =>
            router.push("/result")
          }
          className="w-full mt-4 py-3 text-slate-400 hover:text-white transition"
        >
          ← Natijaga qaytish
        </button>

      </div>

      {/* ===================================================
          HIDDEN CERTIFICATE
      =================================================== */}

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
                  {result.percentage}
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
                  To'g'ri javoblar
                </div>

                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                >
                  {result.score}/{result.total}
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

              <div style={{ textAlign: "left" }}>

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
                {certificateDate}
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