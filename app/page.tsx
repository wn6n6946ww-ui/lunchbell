"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeStatus } from "@/hooks/useRealtimeStatus";
import { WaitingCounter } from "@/components/WaitingCounter";
import { EstimatedTime } from "@/components/EstimatedTime";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemoPanel } from "@/components/DemoPanel";
import { LiveClock } from "@/components/LiveClock";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

const IS_DEMO = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === "demo-cafeteria";
const SCHOOL_NAME = process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "수완고등학교";
const AVG_SERVE_SECONDS = Number(process.env.NEXT_PUBLIC_AVG_SERVE_SECONDS ?? 10);

export default function Home() {
  const { data, error, loading, syncing, refetch } = useRealtimeStatus({
    demo: IS_DEMO,
  });
  const [waitState, setWaitState] = useState({
    remainingSeconds: 0,
    maxSeconds: 0,
  });
  const prevWaitingCountRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const displayedWaitingCount = data
    ? Math.ceil(waitState.remainingSeconds / AVG_SERVE_SECONDS)
    : 0;
  const isDemoMode = IS_DEMO || data?._demo;

  useEffect(() => {
    if (!data) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      prevWaitingCountRef.current = data.waitingCount;
      setWaitState({
        remainingSeconds: data.estimatedWaitSeconds,
        maxSeconds: data.estimatedWaitSeconds,
      });
      return;
    }

    const prevCount = prevWaitingCountRef.current ?? data.waitingCount;
    const countDiff = data.waitingCount - prevCount;
    prevWaitingCountRef.current = data.waitingCount;

    if (data.waitingCount === 0) {
      setWaitState({
        remainingSeconds: 0,
        maxSeconds: 0,
      });
      return;
    }

    if (countDiff === 0) return;

    setWaitState((prev) => {
      const nextRemaining = Math.max(
        0,
        prev.remainingSeconds + countDiff * AVG_SERVE_SECONDS
      );
      return {
        remainingSeconds: nextRemaining,
        maxSeconds:
          nextRemaining === 0 ? 0 : Math.max(prev.maxSeconds, nextRemaining),
      };
    });
  }, [data]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍱</span>
            <div>
              <h1 className="text-base font-bold leading-tight">{SCHOOL_NAME}</h1>
              <LiveClock />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {error ? (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-red-500">연결 오류</span>
                </>
              ) : syncing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                  <span>동기화 중</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                  <span>실시간</span>
                </>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          </div>
        ) : error && !data ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
            <WifiOff className="h-10 w-10 text-red-400" />
            <p className="text-center text-muted-foreground">
              서버에 연결할 수 없습니다.
              <br />
              네트워크 상태를 확인해주세요.
            </p>
            <button
              onClick={refetch}
              className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted"
            >
              다시 시도
            </button>
          </div>
        ) : data ? (
          <>
            {/* ① 급식 상태 배지 */}
            <div className="flex items-center justify-between">
              {data.isOpen ? (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {data.currentMeal === "lunch" ? "🍜 점심 급식 중" : "🍚 저녁 급식 중"}
                </span>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  ⏸ 급식 시간 외
                </span>
              )}
              <StatusBadge count={displayedWaitingCount} />
            </div>

            {/* ② 급식 시간 외 — 카운트다운 (급식 중에는 숨김) */}
            {!data.isOpen && (
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <CountdownTimer
                  nextMeal={data.nextMeal}
                  initialSeconds={data.secondsUntilNext}
                />
              </div>
            )}

            {/* ③ 대기 인원 + 예상 시간 — 항상 표시 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <WaitingCounter count={displayedWaitingCount} />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <EstimatedTime seconds={waitState.remainingSeconds} />
            </div>

            {/* ④ 마지막 센서 업데이트 시각 */}
            <p className="text-center text-xs text-muted-foreground">
              마지막 업데이트:{" "}
              {new Date(data.updatedAt).toLocaleTimeString("ko-KR")}
            </p>

            {/* ⑤ 로컬 데모 패널 */}
            {isDemoMode && (
              <DemoPanel
                currentCount={displayedWaitingCount}
                onDirectSet={(count) => {
                  prevWaitingCountRef.current = count;
                  setWaitState({
                    remainingSeconds: count * AVG_SERVE_SECONDS,
                    maxSeconds: count * AVG_SERVE_SECONDS,
                  });
                }}
                onUpdate={refetch}
              />
            )}
          </>
        ) : null}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        급식줄알리미 — 3초마다 자동 갱신
      </footer>
    </div>
  );
}
