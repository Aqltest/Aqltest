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
  certificateId: string;
  shareUrl: string;
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
    "Sonlar orasidagi qonuniyatlarni aniqlash, ketma-ketliklarni tahlil qilish va matematik bog‘lanishlarni topish bilan bog‘liq topshiriqlar.",

  "Vizual mantiq":
    "Shakllar, naqshlar va vizual o‘zgarishlar orasidagi qoidalarni aniqlashga asoslangan topshiriqlar.",

  Analogiya:
    "Tushunchalar yoki obyektlar orasidagi munosabatni aniqlash va shu munosabatni boshqa vaziyatga qo‘llash bilan bog‘liq topshiriqlar.",

  "Mantiqiy xulosa":
    "Berilgan ma’lumotlardan mantiqiy xulosa chiqarish va shartlar o‘rtasidagi bog‘lanishlarni tushunishga asoslangan topshiriqlar.",

  "Murakkab ketma-ketlik":
    "Bir nechta qoidaga ega bo‘lgan ketma-ketliklarni bosqichma-bosqich tahlil qilish va keyingi elementni aniqlashga qaratilgan topshiriqlar.",

  "Advanced vizual":
    "Murakkab shakllar, fazoviy o‘zgarishlar va bir nechta vizual qoidalarni bir vaqtda tahlil qilishga asoslangan topshiriqlar.",
};

export default function PremiumPage() {
  const router = useRouter();

  const [result, setResult] =
    useState<ResultData | null>(null);

  const [sections, setSections] =
    useState<SectionResult[]>([]);

  const [strongestSection, setStrongestSection] =
    useState<SectionResult | null>(null);

  const [secondStrongestSection, setSecondStrongestSection] =
    useState<SectionResult | null>(null);

  const [name, setName] = useState("");

  const [downloading, setDownloading] =
    useState(false);

  const [sharing, setSharing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [certificateRef] =
    useState<React.RefObject<HTMLDivElement | null>>(
      () => ({ current: null })
    );

  // =========================================================
  // LOAD PREMIUM RESULT
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

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          console.error(
            "Premium natija olinmadi:",
            data
          );

          router.push("/result");
          return;
        }

        const attempt =
          data.attempt;

        setResult({
          score: attempt.score,
          total: attempt.total,
          percentage:
            attempt.percentage,
          weightedScore:
            attempt.weightedScore ??
            attempt.percentage,
          timeUsed:
            attempt.timeUsed,
          answers:
            attempt.answers,
          certificateId:
            attempt.certificateId,
          shareUrl:
            attempt.shareUrl,
        });

        setSections(
          data.sections ?? []
        );

        setStrongestSection(
          data.strongestSection ??
            null
        );

        setSecondStrongestSection(
          data.secondStrongestSection ??
            null
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
      localStorage.getItem(
        "aqltest_name"
      );

    if (savedName) {
      setName(savedName);
    }
  }, [router]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-3">
            🧠
          </div>

          <h1 className="text-xl sm:text-2xl font-bold">
            Premium natija yuklanmoqda...
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Batafsil tahlilingiz tayyorlanmoqda.
          </p>
        </div>
      </main>
    );
  }

  if (
    !result ||
    !strongestSection
  ) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">
            🧠
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            Premium natija topilmadi
          </h1>

          <p className="text-slate-400 text-sm mb-5">
            Premium natijani ochish uchun
            testni ishlab ko‘ring.
          </p>

          <button
            onClick={() =>
              router.push("/result")
            }
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-bold text-sm transition"
          >
            ← Natijaga qaytish
          </button>
        </div>
      </main>
    );
  }

  // =========================================================
  // TIME
  // =========================================================

  const minutes = Math.floor(
    result.timeUsed / 60
  );

  const seconds =
    result.timeUsed % 60;

  const formattedTime =
    `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

  // =========================================================
  // SAVE NAME
  // =========================================================

  function handleNameChange(
    value: string
  ) {
    setName(value);

    localStorage.setItem(
      "aqltest_name",
      value
    );
  }

  // =========================================================
  // CERTIFICATE DATE
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
  // DOWNLOAD CERTIFICATE
  // =========================================================

  async function downloadCertificate() {
    if (!name.trim()) {
      alert(
        "Iltimos, avval ismingizni kiriting."
      );

      return;
    }

    if (!certificateRef.current) {
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
            backgroundColor:
              "#ffffff",
          }
        );

      const imageData =
        canvas.toDataURL(
          "image/png"
        );

      const pdf =
        new jsPDF({
          orientation:
            "landscape",
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
          .replace(
            /\s+/g,
            "-"
          )}.pdf`
      );
    } catch (error) {
      console.error(
        "Certificate PDF error:",
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
  // SHARE RESULT
  // =========================================================

  async function shareResult() {
    if (!result.shareUrl) {
      alert(
        "Ulashish havolasi topilmadi."
      );

      return;
    }

    const shareText =
      `🧠 Men AqlTest testini topshirdim!\n\n` +
      `🏆 AqlTest Score: ${result.weightedScore}/100\n` +
      `💪 Kuchli yo‘nalishim: ${
        strongestSection.name
      }\n\n` +
      `Siz ham o‘zingizni sinab ko‘ring!`;

    setSharing(true);

    try {
      const webApp =
        (
          window as any
        ).Telegram?.WebApp;

      // Telegram Mini App ichida
      if (
        webApp &&
        typeof webApp.openTelegramLink ===
          "function"
      ) {
        const shareUrl =
          `https://t.me/share/url?url=${encodeURIComponent(
            result.shareUrl
          )}&text=${encodeURIComponent(
            shareText
          )}`;

        webApp.openTelegramLink(
          shareUrl
        );

        return;
      }

      // Oddiy browser
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            "AqlTest natijasi",
          text: shareText,
          url: result.shareUrl,
        });

        return;
      }

      // Clipboard fallback
      await navigator.clipboard.writeText(
        `${shareText}\n\n${result.shareUrl}`
      );

      alert(
        "Natija havolasi nusxalandi."
      );
    } catch (error) {
      console.error(
        "Share error:",
        error
      );
    } finally {
      setSharing(false);
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white px-3 py-5 sm:px-4 sm:py-8">

      <div className="max-w-2xl mx-auto">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="text-center mb-7">

          <div className="text-5xl mb-3">
            🧠
          </div>

          <p className="text-blue-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            Premium natija
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold mt-2">
            Batafsil natijangiz
          </h1>

          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Test natijangiz batafsil tahlil qilindi.
          </p>

        </div>

        {/* ===================================================
            SCORE
        =================================================== */}

        <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 mb-5">

          <div className="bg-slate-800 rounded-2xl p-6 sm:p-7 text-center">

            <p className="text-xs sm:text-sm text-slate-400">
              AqlTest Score
            </p>

            <div className="text-6xl sm:text-7xl font-bold text-blue-400 mt-2">
              {result.weightedScore}
            </div>

            <p className="text-slate-500 text-xs mt-1">
              100 ballik tizim
            </p>

            <div className="mt-4 flex items-center justify-center gap-5 text-xs sm:text-sm">

              <div>
                <div className="text-slate-500">
                  To‘g‘ri javoblar
                </div>

                <div className="font-bold text-white mt-1">
                  {result.score}/{result.total}
                </div>
              </div>

              <div className="w-px h-8 bg-slate-700" />

              <div>
                <div className="text-slate-500">
                  Vaqt
                </div>

                <div className="font-bold text-white mt-1">
                  {formattedTime}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            STRONGEST SECTION
        =================================================== */}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 sm:p-6 mb-4">

          <p className="text-blue-400 text-xs font-bold uppercase tracking-wide">
            🏆 Sizning kuchli yo‘nalishingiz
          </p>

          <p className="text-xl sm:text-2xl font-bold mt-2">
            {strongestSection.icon}{" "}
            {strongestSection.name}
          </p>

          <p className="text-slate-300 text-sm leading-relaxed mt-3">
            {sectionDescriptions[
              strongestSection.name
            ] ??
              "Ushbu yo‘nalishdagi topshiriqlarda yaxshi natija ko‘rsatdingiz."}
          </p>

          <div className="bg-slate-900/70 rounded-xl p-3.5 mt-4">

            <p className="text-blue-400 text-xs font-bold mb-1">
              📌 Bu nimani anglatadi?
            </p>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Ushbu test natijangizga ko‘ra,
              siz aynan shu turdagi topshiriqlarda
              nisbatan yaxshi natija ko‘rsatdingiz.
              Bu xulosa AqlTest testidagi
              natijalaringizga asoslangan.
            </p>

          </div>

        </div>

        {/* ===================================================
            SECOND STRONGEST
        =================================================== */}

        {secondStrongestSection && (
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 mb-6">

            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">
              ⭐ Keyingi kuchli yo‘nalish
            </p>

            <p className="text-lg sm:text-xl font-bold mt-2">
              {secondStrongestSection.icon}{" "}
              {secondStrongestSection.name}
            </p>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-2">
              {sectionDescriptions[
                secondStrongestSection.name
              ] ??
                "Ushbu yo‘nalishdagi topshiriqlarda ham yaxshi natija ko‘rsatdingiz."}
            </p>

            <div className="text-blue-400 text-xs font-bold mt-3">
              Natija:{" "}
              {secondStrongestSection.score}/
              {secondStrongestSection.total}
            </div>

          </div>
        )}

        {/* ===================================================
            SECTION RESULTS
        =================================================== */}

        <div className="mb-6">

          <h2 className="font-bold text-base sm:text-lg mb-3">
            📊 Yo‘nalishlar bo‘yicha natija
          </h2>

          <div className="space-y-2">

            {sections.map(
              (section) => (
                <div
                  key={
                    section.name
                  }
                  className="bg-slate-900 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5"
                >

                  <div className="flex justify-between items-center mb-1.5">

                    <div className="flex items-center gap-2 min-w-0">

                      <span className="text-lg shrink-0">
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

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${section.percentage}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* ===================================================
            PREMIUM INFO
        =================================================== */}

        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 mb-5">

          <div className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-1">
            💎 Premium
          </div>

          <h2 className="text-xl sm:text-2xl font-bold">
            Sizning premium imkoniyatlaringiz
          </h2>

          <div className="space-y-2.5 mt-4 text-sm text-slate-300">

            <div className="flex gap-2">
              <span>✓</span>
              <span>
                6 ta yo‘nalish bo‘yicha batafsil tahlil
              </span>
            </div>

            <div className="flex gap-2">
              <span>✓</span>
              <span>
                Kuchli yo‘nalishingiz
              </span>
            </div>

            <div className="flex gap-2">
              <span>✓</span>
              <span>
                AqlTest Score
              </span>
            </div>

            <div className="flex gap-2">
              <span>✓</span>
              <span>
                🏆 Reytingda ishtirok etish
              </span>
            </div>

            <div className="flex gap-2">
              <span>✓</span>
              <span>
                📜 A4 PDF sertifikat
              </span>
            </div>

            <div className="flex gap-2">
              <span>✓</span>
              <span>
                🔗 Natijani ulashish
              </span>
            </div>

          </div>

        </div>

        {/* ===================================================
            CERTIFICATE
        =================================================== */}

        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6">

          <div className="text-center mb-5">

            <div className="text-4xl mb-2">
              🏆
            </div>

            <h2 className="text-2xl font-bold">
              Sertifikatingiz
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              AqlTest natijangiz asosida
              A4 formatdagi PDF sertifikat.
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

          {/* CERTIFICATE ID */}

          <div className="bg-slate-800 rounded-xl p-4 mb-4">

            <div className="text-xs text-slate-500">
              Sertifikat ID
            </div>

            <div className="text-sm sm:text-base font-bold text-slate-200 mt-1 break-all">
              {result.certificateId}
            </div>

          </div>

          <button
            onClick={
              downloadCertificate
            }
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
              : "🏆 Sertifikatni PDF qilib olish"}
          </button>

          <button
            onClick={
              shareResult
            }
            disabled={sharing}
            className={`
              w-full mt-3 py-4 rounded-xl font-bold text-base sm:text-lg transition border
              ${
                sharing
                  ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
              }
            `}
          >
            {sharing
              ? "⏳ Ulashish oynasi..."
              : "🔗 Natijani ulashish"}
          </button>

        </div>

        {/* ===================================================
            SHARE INFO
        =================================================== */}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">

          <div className="text-blue-400 text-xs font-bold mb-1">
            🔗 NATIJANI ULASHISH
          </div>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Natijangizni do‘stlaringiz bilan
            ulashishingiz mumkin. Ulashiladigan
            sahifada shaxsiy javoblaringiz yoki
            Telegram ID'ingiz ko‘rsatilmaydi.
          </p>

        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <div className="grid grid-cols-2 gap-2 mt-4">

          <button
            onClick={() =>
              router.push(
                "/ranking"
              )
            }
            className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold transition"
          >
            🏆 Reyting
          </button>

          <button
            onClick={() =>
              router.push(
                "/result"
              )
            }
            className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold transition"
          >
            ← Natija
          </button>

        </div>

      </div>

      {/* ===================================================
          HIDDEN CERTIFICATE
      =================================================== */}

      <div
        ref={certificateRef}
        style={{
          position:
            "fixed",
          left: "-10000px",
          top: "0",
          width: "1123px",
          height: "794px",
          background:
            "#ffffff",
          color:
            "#111827",
          fontFamily:
            "Arial, sans-serif",
          overflow:
            "hidden",
        }}
      >

        <div
          style={{
            width: "100%",
            height: "100%",
            padding: "45px",
            boxSizing:
              "border-box",
            background:
              "#ffffff",
          }}
        >

          <div
            style={{
              width: "100%",
              height: "100%",
              border:
                "8px solid #1d4ed8",
              boxSizing:
                "border-box",
              position:
                "relative",
              display:
                "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
              justifyContent:
                "center",
              textAlign:
                "center",
            }}
          >

            {/* TOP */}

            <div
              style={{
                fontSize:
                  "24px",
                fontWeight:
                  "bold",
                letterSpacing:
                  "5px",
                color:
                  "#1d4ed8",
                marginBottom:
                  "12px",
              }}
            >
              AQLTEST
            </div>

            <div
              style={{
                fontSize:
                  "18px",
                letterSpacing:
                  "4px",
                color:
                  "#64748b",
                marginBottom:
                  "35px",
              }}
            >
              TEST NATIJA SERTIFIKATI
            </div>

            {/* NAME */}

            <div
              style={{
                fontSize:
                  "48px",
                fontWeight:
                  "bold",
                color:
                  "#111827",
                marginBottom:
                  "20px",
              }}
            >
              {name ||
                "Ism Familiya"}
            </div>

            <div
              style={{
                width:
                  "500px",
                height:
                  "2px",
                background:
                  "#cbd5e1",
                marginBottom:
                  "20px",
              }}
            />

            <div
              style={{
                fontSize:
                  "18px",
                color:
                  "#475569",
                marginBottom:
                  "28px",
              }}
            >
              AqlTest testini muvaffaqiyatli yakunladi
            </div>

            {/* SCORE */}

            <div
              style={{
                display:
                  "flex",
                gap: "70px",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                marginBottom:
                  "35px",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize:
                      "16px",
                    color:
                      "#64748b",
                    marginBottom:
                      "8px",
                  }}
                >
                  AqlTest Score
                </div>

                <div
                  style={{
                    fontSize:
                      "46px",
                    fontWeight:
                      "bold",
                    color:
                      "#1d4ed8",
                  }}
                >
                  {
                    result.weightedScore
                  }
                </div>

              </div>

              <div>

                <div
                  style={{
                    fontSize:
                      "16px",
                    color:
                      "#64748b",
                    marginBottom:
                      "8px",
                  }}
                >
                  To‘g‘ri javoblar
                </div>

                <div
                  style={{
                    fontSize:
                      "32px",
                    fontWeight:
                      "bold",
                  }}
                >
                  {
                    result.score
                  }/
                  {
                    result.total
                  }
                </div>

              </div>

              <div>

                <div
                  style={{
                    fontSize:
                      "16px",
                    color:
                      "#64748b",
                    marginBottom:
                      "8px",
                  }}
                >
                  Vaqt
                </div>

                <div
                  style={{
                    fontSize:
                      "32px",
                    fontWeight:
                      "bold",
                  }}
                >
                  {
                    formattedTime
                  }
                </div>

              </div>

            </div>

            {/* STRONGEST */}

            <div
              style={{
                fontSize:
                  "17px",
                color:
                  "#334155",
                marginBottom:
                  "10px",
              }}
            >
              Kuchli yo‘nalish:
              {" "}
              <strong>
                {
                  strongestSection.name
                }
              </strong>
            </div>

            {/* FOOTER */}

            <div
              style={{
                position:
                  "absolute",
                bottom:
                  "35px",
                left:
                  "50px",
                right:
                  "50px",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-end",
                fontSize:
                  "13px",
                color:
                  "#64748b",
              }}
            >

              <div
                style={{
                  textAlign:
                    "left",
                }}
              >

                <div>
                  Sertifikat ID
                </div>

                <strong
                  style={{
                    color:
                      "#334155",
                  }}
                >
                  {
                    result.certificateId
                  }
                </strong>

              </div>

              <div>
                {
                  certificateDate
                }
              </div>

              <div
                style={{
                  textAlign:
                    "right",
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