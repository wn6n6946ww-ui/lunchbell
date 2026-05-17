"use client";

import { useState, useEffect } from "react";
import { formatCountdown } from "@/lib/mealSchedule";
import type { MealPeriod } from "@/lib/mealSchedule";
import { UtensilsCrossed } from "lucide-react";

interface CountdownTimerProps {
  nextMeal: MealPeriod | null;
  initialSeconds: number | null;
}

export function CountdownTimer({ nextMeal, initialSeconds }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds ?? 0);

  useEffect(() => {
    setSeconds(initialSeconds ?? 0);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          현재 급식 시간이 아닙니다
        </p>
        {nextMeal && (
          <p className="mt-1 text-sm text-muted-foreground">
            다음 {nextMeal.label} ({nextMeal.start} ~ {nextMeal.end})
          </p>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          급식 시작까지
        </p>
        <p className="mt-1 text-4xl font-black tabular-nums">
          {formatCountdown(seconds)}
        </p>
      </div>
    </div>
  );
}
