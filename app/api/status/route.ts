import { NextResponse } from "next/server";
import { getAdminDatabase, hasFirebaseAdminConfig } from "@/lib/firebase-admin";
import { getMealStatus, getMealPeriods } from "@/lib/mealSchedule";
import { calcEstimatedWaitSeconds } from "@/lib/waitTime";

export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __demoWaitingCount: number | undefined;
}

function getDemoCount(): number {
  if (typeof global.__demoWaitingCount === "undefined") {
    global.__demoWaitingCount = 0;
  }
  return global.__demoWaitingCount;
}

// GET /api/status → 현재 대기 인원, 예상 대기 시간, 급식 운영 여부 반환
export async function GET() {
  try {
    const mealStatus = getMealStatus();

    const periods = getMealPeriods();
    const mealSchedule = {
      lunch:  { start: periods[0].start, end: periods[0].end },
      dinner: { start: periods[1].start, end: periods[1].end },
    };

    if (!hasFirebaseAdminConfig()) {
      const waitingCount = getDemoCount();

      return NextResponse.json({
        waitingCount,
        estimatedWaitSeconds: calcEstimatedWaitSeconds(waitingCount),
        isOpen: mealStatus.isOpen,
        currentMeal: mealStatus.currentMeal,
        nextMeal: mealStatus.nextMeal,
        secondsUntilNext: mealStatus.secondsUntilNext,
        secondsUntilMealEnd: mealStatus.secondsUntilMealEnd,
        mealSchedule,
        updatedAt: new Date().toISOString(),
        _demo: true,
        warning: "Firebase 환경변수가 없어 데모 상태로 실행 중입니다.",
      });
    }

    const db = getAdminDatabase();
    const snapshot = await db.ref("cafeteria").get();
    const dbData = snapshot.val() ?? {};

    const waitingCount: number = Math.max(0, dbData.waitingCount ?? 0);
    const updatedAt: string = dbData.updatedAt ?? new Date().toISOString();
    const estimatedWaitSeconds = calcEstimatedWaitSeconds(waitingCount);

    return NextResponse.json({
      waitingCount,
      estimatedWaitSeconds,
      isOpen: mealStatus.isOpen,
      currentMeal: mealStatus.currentMeal,
      nextMeal: mealStatus.nextMeal,
      secondsUntilNext: mealStatus.secondsUntilNext,
      secondsUntilMealEnd: mealStatus.secondsUntilMealEnd,
      mealSchedule,
      updatedAt,
    });
  } catch (err) {
    console.error("[status API error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
