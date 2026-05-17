import { NextResponse } from "next/server";
import { getAdminDatabase } from "@/lib/firebase-admin";
import { getMealStatus } from "@/lib/mealSchedule";
import { calcEstimatedWaitSeconds } from "@/lib/waitTime";

export const dynamic = "force-dynamic";

// GET /api/status → 현재 대기 인원, 예상 대기 시간, 급식 운영 여부 반환
export async function GET() {
  try {
    const db = getAdminDatabase();
    const snapshot = await db.ref("cafeteria").get();
    const data = snapshot.val() ?? {};

    const waitingCount: number = Math.max(0, data.waitingCount ?? 0);
    const updatedAt: string = data.updatedAt ?? new Date().toISOString();
    const mealStatus = getMealStatus();
    const estimatedWaitSeconds = calcEstimatedWaitSeconds(waitingCount);

    return NextResponse.json({
      waitingCount,
      estimatedWaitSeconds,
      isOpen: mealStatus.isOpen,
      currentMeal: mealStatus.currentMeal,
      nextMeal: mealStatus.nextMeal,
      secondsUntilNext: mealStatus.secondsUntilNext,
      updatedAt,
    });
  } catch (err) {
    console.error("[status API error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
