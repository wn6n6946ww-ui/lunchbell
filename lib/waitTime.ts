const AVG_SERVE_SECONDS = Number(process.env.NEXT_PUBLIC_AVG_SERVE_SECONDS ?? 10);

export function calcEstimatedWaitSeconds(waitingCount: number): number {
  return Math.max(0, waitingCount) * AVG_SERVE_SECONDS;
}

export function formatWaitTime(seconds: number): string {
  if (seconds <= 0) return "대기 없음";

  const minutes = Math.floor(seconds / 60);
  const remainSecs = seconds % 60;

  if (remainSecs < 30) return `약 ${minutes}분`;
  return `약 ${minutes + 1}분`;
}

export type CongestionLevel = "free" | "normal" | "busy" | "very-busy";

export interface CongestionInfo {
  level: CongestionLevel;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function getCongestionLevel(count: number): CongestionInfo {
  if (count <= 10) {
    return {
      level: "free",
      label: "여유",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      borderColor: "border-emerald-300 dark:border-emerald-700",
    };
  }
  if (count <= 25) {
    return {
      level: "normal",
      label: "보통",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      borderColor: "border-yellow-300 dark:border-yellow-700",
    };
  }
  if (count < 50) {
    return {
      level: "busy",
      label: "혼잡",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      borderColor: "border-orange-300 dark:border-orange-700",
    };
  }
  return {
    level: "very-busy",
    label: "매우 혼잡",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-300 dark:border-red-700",
  };
}
