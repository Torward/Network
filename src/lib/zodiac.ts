// Zodiac sign determination based on birthdate

interface ZodiacSign {
  name: string;
  englishName: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  traits: string[];
  compatibility: string[];
}

export const zodiacSigns: ZodiacSign[] = [
  {
    name: "Овен",
    englishName: "aries",
    symbol: "♈",
    element: "Fire",
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
    traits: ["Энергичный", "Смелый", "Импульсивный", "Лидер"],
    compatibility: ["leo", "sagittarius", "gemini", "aquarius"],
  },
  {
    name: "Телец",
    englishName: "taurus",
    symbol: "♉",
    element: "Earth",
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
    traits: ["Надежный", "Терпеливый", "Практичный", "Преданный"],
    compatibility: ["virgo", "capricorn", "cancer", "pisces"],
  },
  {
    name: "Близнецы",
    englishName: "gemini",
    symbol: "♊",
    element: "Air",
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 20 },
    traits: ["Общительный", "Любознательный", "Адаптивный", "Разносторонний"],
    compatibility: ["libra", "aquarius", "aries", "leo"],
  },
  {
    name: "Рак",
    englishName: "cancer",
    symbol: "♋",
    element: "Water",
    startDate: { month: 6, day: 21 },
    endDate: { month: 7, day: 22 },
    traits: ["Заботливый", "Эмоциональный", "Интуитивный", "Защитник"],
    compatibility: ["scorpio", "pisces", "taurus", "virgo"],
  },
  {
    name: "Лев",
    englishName: "leo",
    symbol: "♌",
    element: "Fire",
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
    traits: ["Творческий", "Страстный", "Щедрый", "Харизматичный"],
    compatibility: ["aries", "sagittarius", "gemini", "libra"],
  },
  {
    name: "Дева",
    englishName: "virgo",
    symbol: "♍",
    element: "Earth",
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
    traits: [
      "Аналитический",
      "Внимательный к деталям",
      "Скромный",
      "Практичный",
    ],
    compatibility: ["taurus", "capricorn", "cancer", "scorpio"],
  },
  {
    name: "Весы",
    englishName: "libra",
    symbol: "♎",
    element: "Air",
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 },
    traits: ["Дипломатичный", "Справедливый", "Социальный", "Идеалистичный"],
    compatibility: ["gemini", "aquarius", "leo", "sagittarius"],
  },
  {
    name: "Скорпион",
    englishName: "scorpio",
    symbol: "♏",
    element: "Water",
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 },
    traits: ["Страстный", "Решительный", "Интуитивный", "Исследователь"],
    compatibility: ["cancer", "pisces", "virgo", "capricorn"],
  },
  {
    name: "Стрелец",
    englishName: "sagittarius",
    symbol: "♐",
    element: "Fire",
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 },
    traits: [
      "Оптимистичный",
      "Любитель свободы",
      "Интеллектуальный",
      "Энтузиаст",
    ],
    compatibility: ["aries", "leo", "libra", "aquarius"],
  },
  {
    name: "Козерог",
    englishName: "capricorn",
    symbol: "♑",
    element: "Earth",
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
    traits: [
      "Дисциплинированный",
      "Ответственный",
      "Амбициозный",
      "Терпеливый",
    ],
    compatibility: ["taurus", "virgo", "scorpio", "pisces"],
  },
  {
    name: "Водолей",
    englishName: "aquarius",
    symbol: "♒",
    element: "Air",
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
    traits: ["Прогрессивный", "Оригинальный", "Независимый", "Гуманитарный"],
    compatibility: ["gemini", "libra", "aries", "sagittarius"],
  },
  {
    name: "Рыбы",
    englishName: "pisces",
    symbol: "♓",
    element: "Water",
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
    traits: ["Интуитивный", "Эмоциональный", "Артистичный", "Мечтательный"],
    compatibility: ["cancer", "scorpio", "taurus", "capricorn"],
  },
];

/**
 * Determines the zodiac sign based on a birthdate
 * @param birthdate Date object or string representing a birthdate
 * @returns The zodiac sign object or null if invalid date
 */
export function getZodiacSign(birthdate: Date | string): ZodiacSign | null {
  try {
    const date =
      typeof birthdate === "string" ? new Date(birthdate) : birthdate;
    if (isNaN(date.getTime())) return null;

    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getDate();

    return (
      zodiacSigns.find((sign) => {
        // Handle zodiac signs that span across year boundary (Capricorn)
        if (sign.startDate.month > sign.endDate.month) {
          return (
            (month === sign.startDate.month && day >= sign.startDate.day) ||
            (month === sign.endDate.month && day <= sign.endDate.day)
          );
        }

        // Handle regular zodiac signs
        return (
          (month === sign.startDate.month && day >= sign.startDate.day) ||
          (month === sign.endDate.month && day <= sign.endDate.day)
        );
      }) || null
    );
  } catch (error) {
    console.error("Error determining zodiac sign:", error);
    return null;
  }
}

/**
 * Gets compatibility between two zodiac signs
 * @param sign1 First zodiac sign (english name)
 * @param sign2 Second zodiac sign (english name)
 * @returns Compatibility score from 1-5
 */
export function getCompatibilityScore(sign1: string, sign2: string): number {
  const zodiac1 = zodiacSigns.find(
    (z) => z.englishName === sign1.toLowerCase(),
  );
  if (!zodiac1) return 0;

  // Direct compatibility (listed in compatibility array)
  if (zodiac1.compatibility.includes(sign2.toLowerCase())) {
    return 5; // Excellent compatibility
  }

  // Same element compatibility
  const zodiac2 = zodiacSigns.find(
    (z) => z.englishName === sign2.toLowerCase(),
  );
  if (zodiac2 && zodiac1.element === zodiac2.element) {
    return 4; // Good compatibility (same element)
  }

  // Complementary elements
  const complementaryElements: Record<string, string[]> = {
    Fire: ["Air"],
    Air: ["Fire"],
    Earth: ["Water"],
    Water: ["Earth"],
  };

  if (
    zodiac2 &&
    complementaryElements[zodiac1.element].includes(zodiac2.element)
  ) {
    return 3; // Moderate compatibility (complementary elements)
  }

  // Neutral elements
  const neutralElements: Record<string, string[]> = {
    Fire: ["Earth"],
    Earth: ["Fire"],
    Air: ["Water"],
    Water: ["Air"],
  };

  if (zodiac2 && neutralElements[zodiac1.element].includes(zodiac2.element)) {
    return 2; // Low compatibility (neutral elements)
  }

  // Default - challenging compatibility
  return 1;
}
