"use client";

import { getCongestionLevel } from "@/lib/waitTime";
import { cn } from "@/lib/utils";

interface WaitingCounterProps {
  count: number;
}

export function WaitingCounter({ count }: WaitingCounterProps) {
  const info = getCongestionLevel(count);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-muted-foreground">현재 대기 인원</p>

      <div className={cn("flex items-end gap-1", info.color)}>
        <span className="text-6xl font-black leading-none tabular-nums">
          {count}
        </span>
        <span className="mb-1 text-xl font-semibold text-muted-foreground">
          명
        </span>
      </div>

      <div
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm font-bold",
          info.bgColor,
          info.color,
          info.borderColor
        )}
      >
        혼잡도: {info.label}
      </div>
    </div>
  );
}
