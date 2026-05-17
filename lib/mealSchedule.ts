import { getMealTimeSettings } from "@/lib/adminSettings";

export type MealType = "lunch" | "dinner";

export interface MealPeriod {
  type: MealType;
  label: string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

export interface MealStatus {
  isOpen: boolean;
  currentMeal: MealType | null;
  nextMeal: MealPeriod | null;
  secondsUntilNext: number | null;
  secondsUntilMealEnd: number | null;
}

function parseTime(hhmm: string): { hours: number; minutes: number } {
  const [h, m] = hhmm.split(":").map(Number);
  return { hours: h, minutes: m };
}

function toMinutes(hhmm: string): number {
  const { hours, minutes } = parseTime(hhmm);
  return hours * 60 + minutes;
}

export function getMealPeriods(): MealPeriod[] {
  const s = getMealTimeSettings();
  return [
    { type: "lunch", label: "점심", start: s.lunchStart, end: s.lunchEnd },
    { type: "dinner", label: "저녁", start: s.dinnerStart, end: s.dinnerEnd },
  ];
}

/** KST(Asia/Seoul) 기준으로 현재 시·분을 분 단위로 반환 */
function getKSTMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

export function getMealStatus(now?: Date): MealStatus {
  const date = now ?? new Date();
  const currentMinutes = getKSTMinutes(date);
  const periods = getMealPeriods();

  // 현재 급식 시간인지 확인
  for (const period of periods) {
    const start = toMinutes(period.start);
    const end = toMinutes(period.end);
    if (currentMinutes >= start && currentMinutes < end) {
      return {
        isOpen: true,
        currentMeal: period.type,
        nextMeal: null,
        secondsUntilNext: null,
        secondsUntilMealEnd: (end - currentMinutes) * 60,
      };
    }
  }

  // 다음 급식 시간 계산
  let closestNext: MealPeriod | null = null;
  let minSeconds = Infinity;

  for (const period of periods) {
    const startMinutes = toMinutes(period.start);
    let diff = startMinutes - currentMinutes;

    // 오늘 이미 지났으면 내일로 계산
    if (diff < 0) {
      diff += 24 * 60;
    }

    if (diff < minSeconds) {
      minSeconds = diff;
      closestNext = period;
    }
  }

  return {
    isOpen: false,
    currentMeal: null,
    nextMeal: closestNext,
    secondsUntilNext: minSeconds * 60,
    secondsUntilMealEnd: null,
  };
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "곧 시작";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}
