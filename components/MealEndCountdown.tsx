"use client";

import { useState, useEffect, useRef } from "react";
import { formatCountdown } from "@/lib/mealSchedule";
import { Timer } from "lucide-react";

interface MealEndCountdownProps {
  initialSeconds: number;
  mealLabel: string;
}

export function MealEndCountdown({ initialSeconds, mealLabel }: MealEndCountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const prevRef = useRef(initialSeconds);

  // 폴링으로 새 값이 오면 리셋
  useEffect(() => {
    if (initialSeconds !== prevRef.current) {
      prevRef.current = initialSeconds;
      setSeconds(initialSeconds);
    }
  }, [initialSeconds]);

  // 1초마다 감소
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const isUrgent = seconds > 0 && seconds <= 300; // 5분 이하면 강조

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
        isUrgent
          ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40"
          : "border-border bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Timer className={`h-4 w-4 ${isUrgent ? "text-red-500" : ""}`} />
        <span>{mealLabel} 종료까지</span>
      </div>
      <span
        className={`font-mono text-lg font-bold tabular-nums ${
          isUrgent ? "text-red-600 dark:text-red-400" : "text-foreground"
        }`}
      >
        {seconds <= 0 ? "종료" : formatCountdown(seconds)}
      </span>
    </div>
  );
}
