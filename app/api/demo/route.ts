import { NextRequest, NextResponse } from "next/server";
import { getMealStatus, getMealPeriods } from "@/lib/mealSchedule";
import { calcEstimatedWaitSeconds } from "@/lib/waitTime";

/**
 * 로컬 개발 전용 인메모리 데모 API
 * Firebase 설정 없이도 UI 개발·테스트가 가능하도록 제공
 *
 * GET  /api/demo         → 현재 상태 조회
 * POST /api/demo         → 카운터 조작 { action: "enter" | "exit" | "reset" }
 */

// Next.js 서버리스 함수는 요청마다 새 인스턴스가 뜰 수 있어서
// 개발 서버(로컬)에서는 global 객체에 저장
declare global {
  // eslint-disable-next-line no-var
  var __demoWaitingCount: number | undefined;
}

function getCount(): number {
  if (typeof global.__demoWaitingCount === "undefined") {
    global.__demoWaitingCount = 0;
  }
  return global.__demoWaitingCount;
}

function setCount(n: number) {
  global.__demoWaitingCount = Math.max(0, n);
}

export async function GET() {
  const waitingCount = getCount();
  const mealStatus = getMealStatus();
  const estimatedWaitSeconds = calcEstimatedWaitSeconds(waitingCount);
  const periods = getMealPeriods();
  const mealSchedule = {
    lunch:  { start: periods[0].start, end: periods[0].end },
    dinner: { start: periods[1].start, end: periods[1].end },
  };

  return NextResponse.json({
    waitingCount,
    estimatedWaitSeconds,
    isOpen: mealStatus.isOpen,
    currentMeal: mealStatus.currentMeal,
    nextMeal: mealStatus.nextMeal,
    secondsUntilNext: mealStatus.secondsUntilNext,
    secondsUntilMealEnd: mealStatus.secondsUntilMealEnd,
    mealSchedule,
    updatedAt: new Date().toISOString(),
    _demo: true,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, value } = body as { action: string; value?: number };

  const current = getCount();

  if (action === "enter") {
    setCount(current + 1);
  } else if (action === "exit") {
    setCount(current - 1);
  } else if (action === "reset") {
    setCount(0);
  } else if (action === "set" && typeof value === "number") {
    setCount(value);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true, waitingCount: getCount() });
}
