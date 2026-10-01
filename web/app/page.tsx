"use client";
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        <div className="mb-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl text-slate-950">
            🧠
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            AqlTest
          </h1>

          <p className="mt-4 text-lg text-slate-300">
            IQ darajangizni sinab ko‘ring
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex justify-center gap-8 text-sm text-slate-300">
            <div>
              <div className="text-xl font-semibold text-white">24</div>
              savol
            </div>

            <div>
              <div className="text-xl font-semibold text-white">4–12</div>
              daqiqa
            </div>

            <div>
              <div className="text-xl font-semibold text-white">100%</div>
              bepul
            </div>
          </div>

          <button 
          onClick={() => window.location.href = "/test"}
          className="mt-8 w-full rounded-2xl bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200">
            IQ TESTNI BOSHLASH
          </button>

          <p className="mt-4 text-xs text-slate-500">
            Test yakunida natijangizni batafsil ko‘rishingiz mumkin.
          </p>
        </div>

        <p className="mt-8 text-xs text-slate-500">
          AqlTest — o‘zingiz haqingizda ko‘proq bilish uchun.
        </p>

      </div>
    </main>
  );
}