"use client";

import { useEffect, useState } from "react";
import { questions } from "../data/questions";

// =========================
// DEBUG MODE
// true  = 5 soniyada avtomatik yakunlanadi
// false = oddiy 12 daqiqalik test
// =========================
const DEBUG_MODE = false;

const TEST_TIME = 12 * 60;
const DEBUG_TIME = 5;

export default function TestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(questions.length).fill(null)
  );

  const [finished, setFinished] = useState(false);

  const [timeLeft, setTimeLeft] = useState(
    DEBUG_MODE ? DEBUG_TIME : TEST_TIME
  );

  const question = questions[currentQuestion];

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    if (finished) return;

    if (timeLeft <= 0) {
      finishTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, finished]);

  // =========================
  // FORMAT TIME
  // =========================
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // =========================
  // FINISH TEST
  // =========================
  async function finishTest(
    currentAnswer: string | null = selectedAnswer
  ) {
    if (finished) return;

    const finalAnswers = [...answers];

    if (currentAnswer) {
      finalAnswers[currentQuestion] = currentAnswer;
    }

    const totalTestTime =
      DEBUG_MODE ? DEBUG_TIME : TEST_TIME;

    const timeUsed =
      totalTestTime - timeLeft;

    // =========================
    // SERVER
    // Ball server tomonidan hisoblanadi
    // =========================
    try {
      const response = await fetch("/api/attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeUsed,
          answers: finalAnswers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Attempt saqlanmadi:",
          data
        );

        return;
      }

      console.log(
        "Attempt saqlandi:",
        data
      );

      // Server yaratgan attempt ID
      if (data.attemptId) {
        localStorage.setItem(
          "aqltest_attempt_id",
          data.attemptId
        );
      }

      // =========================
      // FAQAT UI COMPATIBILITY
      // =========================
      localStorage.setItem(
        "aqltest_result",
        JSON.stringify({
          score: data.score,
          total: data.total,
          percentage: data.percentage,
          timeUsed,
          answers: finalAnswers,
        })
      );

      setFinished(true);

      window.location.href = "/result";
    } catch (error) {
      console.error(
        "Serverga yuborishda xatolik:",
        error
      );
    }
  }

  // =========================
  // NEXT QUESTION
  // =========================
  function handleNext() {
    if (!selectedAnswer) return;

    const newAnswers = [...answers];

    newAnswers[currentQuestion] =
      selectedAnswer;

    setAnswers(newAnswers);

    if (
      currentQuestion ===
      questions.length - 1
    ) {
      finishTest(selectedAnswer);
      return;
    }

    setCurrentQuestion(
      (prev) => prev + 1
    );

    setSelectedAnswer(null);
  }

  // =========================
  // OPTION LABEL
  // =========================
  function getOptionLabel(
    option:
      | string
      | {
          label: string;
          image: string;
        }
  ) {
    if (typeof option === "string") {
      return option.charAt(0);
    }

    return option.label;
  }

  // =========================
  // OPTION TEXT
  // =========================
  function getOptionText(
    option:
      | string
      | {
          label: string;
          image: string;
        }
  ) {
    if (typeof option === "string") {
      return option;
    }

    return option.label;
  }

  // =========================
  // OPTION IMAGE
  // =========================
  function getOptionImage(
    option:
      | string
      | {
          label: string;
          image: string;
        }
  ) {
    if (typeof option === "string") {
      return undefined;
    }

    return option.image;
  }

  // =========================
  // PROGRESS
  // =========================
  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  // =========================
  // UI
  // =========================
  return (
    <main className="min-h-screen bg-slate-950 text-white px-3 py-4 sm:px-4 sm:py-6">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-xs sm:text-sm text-slate-400">
              Savol
            </p>

            <p className="text-lg sm:text-xl font-bold">
              {currentQuestion + 1}

              <span className="text-slate-500">
                {" "}
                / {questions.length}
              </span>
            </p>
          </div>

          <div
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-sm sm:text-base ${
              timeLeft <= 60
                ? "bg-red-500/20 text-red-400"
                : "bg-slate-800 text-blue-400"
            }`}
          >
            ⏱️ {formattedTime}
          </div>
        </div>

        {/* DEBUG INDICATOR */}
        {DEBUG_MODE && (
          <div className="mb-3 sm:mb-4 text-center text-xs text-yellow-400">
            DEBUG MODE — test{" "}
            {DEBUG_TIME} soniyada yakunlanadi
          </div>
        )}

        {/* PROGRESS */}
        <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden mb-5 sm:mb-8">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* QUESTION */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-7">

          <h1 className="text-base sm:text-lg md:text-2xl font-bold mb-4 sm:mb-5 md:mb-6 leading-snug sm:leading-relaxed break-words">
            {question.question}
          </h1>

          {/* MAIN QUESTION IMAGE */}
          {question.image && (
            <div className="mb-5 sm:mb-6 md:mb-8 flex justify-center">
              <img
                src={question.image}
                alt={`Savol ${
                  currentQuestion + 1
                }`}
                className="max-w-full max-h-[300px] sm:max-h-[360px] md:max-h-[420px] object-contain rounded-xl"
              />
            </div>
          )}

          {/* OPTIONS */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">

            {question.options.map(
              (option) => {

                const label =
                  getOptionLabel(option);

                const text =
                  getOptionText(option);

                const image =
                  getOptionImage(option);

                const isSelected =
                  selectedAnswer === label;

                return (
                  <button
                    key={label}
                    onClick={() =>
                      setSelectedAnswer(label)
                    }
                    className={`
                      rounded-xl
                      border
                      transition
                      overflow-hidden
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-slate-700 bg-slate-800 hover:bg-slate-700"
                      }
                    `}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`Variant ${label}`}
                        className="w-full h-24 sm:h-28 md:h-36 object-contain p-2 sm:p-2.5 md:p-3"
                      />
                    ) : (
                      <div className="p-3 sm:p-4 md:p-5 text-center">

                        <div className="text-sm sm:text-base md:text-lg font-semibold break-words">
                          {text}
                        </div>

                      </div>
                    )}
                  </button>
                );
              }
            )}

          </div>

          {/* NEXT BUTTON */}
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`
              w-full mt-4 sm:mt-6 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition
              ${
                selectedAnswer
                  ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }
            `}
          >
            {currentQuestion ===
            questions.length - 1
              ? "Testni yakunlash"
              : "Keyingi savol →"}
          </button>

        </div>
      </div>
    </main>
  );
}