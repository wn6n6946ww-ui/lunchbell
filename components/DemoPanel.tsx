"use client";

import { useState } from "react";

interface DemoPanelProps {
  currentCount: number;
  onUpdate: () => void;
  onDirectSet?: (count: number) => void;
}

export function DemoPanel({ currentCount, onUpdate, onDirectSet }: DemoPanelProps) {
  const [loading, setLoading] = useState(false);
  const [customValue, setCustomValue] = useState("");

  async function callDemo(action: string, value?: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value }),
      });
      const result = (await res.json()) as { waitingCount?: number };

      if (action === "set" && typeof result.waitingCount === "number") {
        onDirectSet?.(result.waitingCount);
        setCustomValue("");
      }

      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-950/30">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-yellow-400 px-2 py-0.5 text-xs font-bold text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100">
          DEV ONLY
        </span>
        <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
          로컬 테스트 패널 (Firebase 없이 동작)
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => callDemo("enter")}
          disabled={loading}
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          +1 입장
        </button>
        <button
          onClick={() => callDemo("exit")}
          disabled={loading || currentCount === 0}
          className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          -1 배식완료
        </button>
        <button
          onClick={() => callDemo("reset")}
          disabled={loading}
          className="rounded-md bg-gray-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-gray-600 disabled:opacity-50"
        >
          초기화
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={200}
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="인원 직접 설정"
          className="w-36 rounded-md border border-yellow-300 bg-white px-2 py-1.5 text-sm dark:border-yellow-700 dark:bg-black/30 dark:text-white"
        />
        <button
          onClick={() => {
            const n = parseInt(customValue, 10);
            if (!isNaN(n) && n >= 0) callDemo("set", n);
          }}
          disabled={loading}
          className="rounded-md bg-yellow-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-50"
        >
          적용
        </button>
      </div>
    </div>
  );
}
