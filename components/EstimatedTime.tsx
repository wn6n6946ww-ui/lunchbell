"use client";

import { formatWaitTime } from "@/lib/waitTime";
import { Clock } from "lucide-react";

interface EstimatedTimeProps {
  seconds: number;
}

export function EstimatedTime({ seconds }: EstimatedTimeProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4" />
        예상 대기 시간
      </div>
      <p className="text-3xl font-bold tabular-nums">
        {formatWaitTime(seconds)}
      </p>
    </div>
  );
}
