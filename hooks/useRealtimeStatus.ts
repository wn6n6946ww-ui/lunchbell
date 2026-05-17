"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MealPeriod, MealType } from "@/lib/mealSchedule";

export interface StatusData {
  waitingCount: number;
  estimatedWaitSeconds: number;
  isOpen: boolean;
  currentMeal: MealType | null;
  nextMeal: MealPeriod | null;
  secondsUntilNext: number | null;
  updatedAt: string;
  _demo?: boolean;
}

interface UseRealtimeStatusOptions {
  /** 폴링 간격 (ms), 기본값 3000 */
  interval?: number;
  /** true이면 Firebase 대신 로컬 데모 API 사용 */
  demo?: boolean;
}

const POLL_INTERVAL = 3000;

export function useRealtimeStatus(options: UseRealtimeStatusOptions = {}) {
  const { interval = POLL_INTERVAL, demo = false } = options;
  const endpoint = demo ? "/api/demo" : "/api/status";

  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: StatusData = await res.json();
      if (mountedRef.current) {
        setData(json);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "연결 오류");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setSyncing(false);
      }
    }
  }, [endpoint]);

  useEffect(() => {
    mountedRef.current = true;

    const poll = async () => {
      await fetchStatus();
      if (mountedRef.current) {
        timerRef.current = setTimeout(poll, interval);
      }
    };

    poll();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchStatus, interval]);

  return { data, error, loading, syncing, refetch: fetchStatus };
}
