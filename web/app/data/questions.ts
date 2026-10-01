export type ImageOption = {
  label: string;
  image: string;
};

export type Question = {
  id: number;
  question: string;
  image?: string;
  options: string[] | ImageOption[];
};

export const questions: Question[] = [
  // =========================================================
  // 1 — SONLI MANTIQ
  // =========================================================
  {
    id: 1,
    question: "2, 4, 8, 16, ?",
    options: [
      "A) 24",
      "B) 28",
      "C) 30",
      "D) 32",
      "E) 34",
      "F) 36",
    ],
  },

  // =========================================================
  // 2 — SONLI MANTIQ
  // =========================================================
  {
    id: 2,
    question: "3, 6, 11, 18, ?",
    options: [
      "A) 24",
      "B) 25",
      "C) 27",
      "D) 28",
      "E) 29",
      "F) 31",
    ],
  },

  // =========================================================
  // 3 — SONLI MANTIQ
  // =========================================================
  {
    id: 3,
    question: "81, 27, 9, 3, ?",
    options: [
      "A) 0",
      "B) 1",
      "C) 2",
      "D) 1.5",
      "E) 3",
      "F) 6",
    ],
  },

  // =========================================================
  // 4 — SONLI MANTIQ
  // =========================================================
  {
    id: 4,
    question: "4, 7, 13, 25, ?",
    options: [
      "A) 37",
      "B) 43",
      "C) 47",
      "D) 49",
      "E) 51",
      "F) 53",
    ],
  },

  // =========================================================
  // 5 — VIZUAL
  // =========================================================
  {
    id: 5,
    question:
      "Qaysi variant matritsadagi qonuniyatni to‘g‘ri davom ettiradi?",
    image: "/questions/question-5.png",
    options: [
      {
        label: "A",
        image: "/questions/q5-a.png",
      },
      {
        label: "B",
        image: "/questions/q5-b.png",
      },
      {
        label: "C",
        image: "/questions/q5-c.png",
      },
      {
        label: "D",
        image: "/questions/q5-d.png",
      },
      {
        label: "E",
        image: "/questions/q5-e.png",
      },
      {
        label: "F",
        image: "/questions/q5-f.png",
      },
    ],
  },

  // =========================================================
  // 6 — VIZUAL
  // =========================================================
  {
    id: 6,
    question:
      "Qaysi variant yetishmayotgan katakni to‘g‘ri to‘ldiradi?",
    image: "/questions/question-6.png",
    options: [
      {
        label: "A",
        image: "/questions/q6-a.png",
      },
      {
        label: "B",
        image: "/questions/q6-b.png",
      },
      {
        label: "C",
        image: "/questions/q6-c.png",
      },
      {
        label: "D",
        image: "/questions/q6-d.png",
      },
      {
        label: "E",
        image: "/questions/q6-e.png",
      },
      {
        label: "F",
        image: "/questions/q6-f.png",
      },
    ],
  },

  // =========================================================
  // 7 — YANGI VIZUAL
  // =========================================================
  {
    id: 7,
    question: "Matritsadagi qonuniyatni toping.",
    image: "/questions/question-7.png",
    options: [
      {
        label: "A",
        image: "/questions/q7-a.png",
      },
      {
        label: "B",
        image: "/questions/q7-b.png",
      },
      {
        label: "C",
        image: "/questions/q7-c.png",
      },
      {
        label: "D",
        image: "/questions/q7-d.png",
      },
      {
        label: "E",
        image: "/questions/q7-e.png",
      },
      {
        label: "F",
        image: "/questions/q7-f.png",
      },
    ],
  },

  // =========================================================
  // 8 — VIZUAL
  // =========================================================
  {
    id: 8,
    question:
      "Qaysi variant matritsani to‘g‘ri yakunlaydi?",
    image: "/questions/question-8.png",
    options: [
      {
        label: "A",
        image: "/questions/q8-a.png",
      },
      {
        label: "B",
        image: "/questions/q8-b.png",
      },
      {
        label: "C",
        image: "/questions/q8-c.png",
      },
      {
        label: "D",
        image: "/questions/q8-d.png",
      },
      {
        label: "E",
        image: "/questions/q8-e.png",
      },
      {
        label: "F",
        image: "/questions/q8-f.png",
      },
    ],
  },

  // =========================================================
  // 9 — ANALOGIYA
  // =========================================================
  {
    id: 9,
    question: "Qo‘l : Barmoq = Oyoq : ?",
    options: [
      "A) Tizza",
      "B) Oyoq barmog‘i",
      "C) Tovon",
      "D) Boldir",
      "E) Panja",
      "F) Tirnoq",
    ],
  },

  // =========================================================
  // 10 — ANALOGIYA
  // =========================================================
  {
    id: 10,
    question: "Kitob : O‘qish = Musiqa : ?",
    options: [
      "A) Yozish",
      "B) Ko‘rish",
      "C) Eshitish",
      "D) Chizish",
      "E) Gapirish",
      "F) O‘rganish",
    ],
  },

  // =========================================================
  // 11 — MANTIQ
  // =========================================================
  {
    id: 11,
    question:
      "Ali Validan tezroq. Vali Sardordan tezroq. Diyor Alidan sekinroq, lekin Sardordan tezroq. Kim eng tez?",
    options: [
      "A) Ali",
      "B) Vali",
      "C) Sardor",
      "D) Diyor",
      "E) Ali va Diyor",
      "F) Aniqlab bo‘lmaydi",
    ],
  },

  // =========================================================
  // 12 — MANTIQ
  // =========================================================
  {
    id: 12,
    question:
      "5 kishi bir qatorda turibdi. A B ning chapida. B C ning darhol chapida. D A dan o‘ngda. E B ga qo‘shni emas. C chetda emas. A C ga qo‘shni emas. Qaysi tartib mumkin?",
    options: [
      "A) D A B C E",
      "B) B C A D E",
      "C) E A B C D",
      "D) A B C D E",
      "E) C B A D E",
      "F) E C B A D",
    ],
  },

  // =========================================================
  // 13 — EVEREST
  // =========================================================
  {
    id: 13,
    question:
      "A, B, C, D, E, F va G 7 ta pozitsiyaga joylashtiriladi. D A dan darhol keyin keladi. B C dan darhol oldin keladi. C D dan keyin turadi. E F dan oldin turadi. G chetda emas. A E dan oldin turadi. F B dan oldin turadi. G D yoki B ga qo‘shni emas. Qaysi tartib mumkin?",
    options: [
      "A) A D E G F B C",
      "B) A D G E F B C",
      "C) A D E F G B C",
      "D) E A D G F B C",
      "E) G A D E F B C",
      "F) A E D G F B C",
    ],
  },

  // =========================================================
  // 14 — MANTIQ
  // =========================================================
  {
    id: 14,
    question:
      "Ali Validan tezroq. Vali Sardordan tezroq. Diyor Alidan sekinroq, lekin Sardordan tezroq. Kim eng tez?",
    options: [
      "A) Ali",
      "B) Vali",
      "C) Sardor",
      "D) Diyor",
      "E) Vali va Diyor",
      "F) Aniqlab bo‘lmaydi",
    ],
  },

  // =========================================================
  // 15 — TARTIBLASH
  // =========================================================
  {
    id: 15,
    question:
      "Aziz Bekning chapida turadi. Dilshod Azizning o‘ngida, lekin Bekning chapida turadi. Kim Aziz va Bekning orasida?",
    options: [
      "A) Aziz",
      "B) Bek",
      "C) Dilshod",
      "D) Sardor",
      "E) Vali",
      "F) Aniqlab bo‘lmaydi",
    ],
  },

  // =========================================================
  // 16 — MANTIQ
  // =========================================================
  {
    id: 16,
    question:
      "Barcha ko‘k predmetlar katta. Ba'zi katta predmetlar og‘ir. Qaysi xulosa aniq to‘g‘ri?",
    options: [
      "A) Barcha katta predmetlar ko‘k",
      "B) Ko‘k predmetlarning barchasi katta",
      "C) Barcha katta predmetlar og‘ir",
      "D) Ko‘k predmetlarning barchasi og‘ir",
      "E) Hech bir ko‘k predmet og‘ir emas",
      "F) Barcha og‘ir predmetlar ko‘k",
    ],
  },

  // =========================================================
  // 17 — SONLI MANTIQ
  // =========================================================
  {
    id: 17,
    question: "2, 6, 12, 20, ?",
    options: [
      "A) 24",
      "B) 28",
      "C) 30",
      "D) 32",
      "E) 34",
      "F) 36",
    ],
  },

  // =========================================================
  // 18 — SONLI MANTIQ
  // =========================================================
  {
    id: 18,
    question: "1, 4, 10, 22, ?",
    options: [
      "A) 42",
      "B) 44",
      "C) 46",
      "D) 48",
      "E) 50",
      "F) 52",
    ],
  },

  // =========================================================
  // 19 — SONLI MANTIQ
  // =========================================================
  {
    id: 19,
    question: "100, 96, 88, 76, ?",
    options: [
      "A) 56",
      "B) 58",
      "C) 60",
      "D) 62",
      "E) 64",
      "F) 66",
    ],
  },

  // =========================================================
  // 20 — SONLI MANTIQ
  // =========================================================
  {
    id: 20,
    question: "5, 8, 14, 26, ?",
    options: [
      "A) 42",
      "B) 46",
      "C) 50",
      "D) 52",
      "E) 54",
      "F) 56",
    ],
  },

  // =========================================================
  // 21 — ADVANCED VIZUAL
  // =========================================================
  {
    id: 21,
    question:
      "Murakkab matritsadagi qonuniyatni toping.",
    image: "/questions/question-21.png",
    options: [
      {
        label: "A",
        image: "/questions/q21-a.png",
      },
      {
        label: "B",
        image: "/questions/q21-b.png",
      },
      {
        label: "C",
        image: "/questions/q21-c.png",
      },
      {
        label: "D",
        image: "/questions/q21-d.png",
      },
      {
        label: "E",
        image: "/questions/q21-e.png",
      },
      {
        label: "F",
        image: "/questions/q21-f.png",
      },
    ],
  },

  // =========================================================
  // 22 — ADVANCED VIZUAL
  // =========================================================
  {
    id: 22,
    question:
      "Nuqtalar matritsasidagi qonuniyatni toping.",
    image: "/questions/question-22.png",
    options: [
      {
        label: "A",
        image: "/questions/q22-a.png",
      },
      {
        label: "B",
        image: "/questions/q22-b.png",
      },
      {
        label: "C",
        image: "/questions/q22-c.png",
      },
      {
        label: "D",
        image: "/questions/q22-d.png",
      },
      {
        label: "E",
        image: "/questions/q22-e.png",
      },
      {
        label: "F",
        image: "/questions/q22-f.png",
      },
    ],
  },

  // =========================================================
  // 23 — ADVANCED VIZUAL
  // =========================================================
  {
    id: 23,
    question:
      "Shakllar matritsasidagi qonuniyatni toping.",
    image: "/questions/question-23.png",
    options: [
      {
        label: "A",
        image: "/questions/q23-a.png",
      },
      {
        label: "B",
        image: "/questions/q23-b.png",
      },
      {
        label: "C",
        image: "/questions/q23-c.png",
      },
      {
        label: "D",
        image: "/questions/q23-d.png",
      },
      {
        label: "E",
        image: "/questions/q23-e.png",
      },
      {
        label: "F",
        image: "/questions/q23-f.png",
      },
    ],
  },

  // =========================================================
  // 24 — ADVANCED VIZUAL
  // =========================================================
  {
    id: 24,
    question:
      "Matritsadagi shakllar va chiziqlar qonuniyatini toping.",
    image: "/questions/question-24.png",
    options: [
      {
        label: "A",
        image: "/questions/q24-a.png",
      },
      {
        label: "B",
        image: "/questions/q24-b.png",
      },
      {
        label: "C",
        image: "/questions/q24-c.png",
      },
      {
        label: "D",
        image: "/questions/q24-d.png",
      },
      {
        label: "E",
        image: "/questions/q24-e.png",
      },
      {
        label: "F",
        image: "/questions/q24-f.png",
      },
    ],
  },
];