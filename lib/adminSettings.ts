// 서버 런타임 인메모리 급식 시간 오버라이드
// Firebase 미설정 환경에서도 동작하며, Firebase 설정 시 DB에 저장·로드 가능

export interface MealTimeSettings {
  lunchStart: string;
  lunchEnd: string;
  dinnerStart: string;
  dinnerEnd: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __mealTimeSettings: MealTimeSettings | undefined;
}

function getDefaultSettings(): MealTimeSettings {
  return {
    lunchStart: process.env.NEXT_PUBLIC_LUNCH_START ?? "11:30",
    lunchEnd: process.env.NEXT_PUBLIC_LUNCH_END ?? "13:30",
    dinnerStart: process.env.NEXT_PUBLIC_DINNER_START ?? "17:30",
    dinnerEnd: process.env.NEXT_PUBLIC_DINNER_END ?? "19:00",
  };
}

export function getMealTimeSettings(): MealTimeSettings {
  if (!global.__mealTimeSettings) {
    global.__mealTimeSettings = getDefaultSettings();
  }
  return global.__mealTimeSettings;
}

export function setMealTimeSettings(settings: MealTimeSettings): void {
  global.__mealTimeSettings = { ...settings };
}

export function resetMealTimeSettings(): void {
  global.__mealTimeSettings = getDefaultSettings();
}
