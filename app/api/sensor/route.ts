import { NextRequest, NextResponse } from "next/server";
import { getAdminDatabase } from "@/lib/firebase-admin";

// Arduino/ESP32가 호출하는 엔드포인트
// GET /api/sensor?type=enter&key=SECRET  → 대기 인원 +1
// GET /api/sensor?type=exit&key=SECRET   → 대기 인원 -1
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const key = searchParams.get("key");

  // API 키 인증
  const validKey = process.env.SENSOR_API_KEY;
  if (!validKey || key !== validKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (type !== "enter" && type !== "exit") {
    return NextResponse.json(
      { error: "type must be 'enter' or 'exit'" },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDatabase();
    const ref = db.ref("cafeteria/waitingCount");

    const snapshot = await ref.get();
    const current: number = snapshot.val() ?? 0;

    let updated: number;
    if (type === "enter") {
      updated = current + 1;
    } else {
      updated = Math.max(0, current - 1);
    }

    await ref.set(updated);
    await db.ref("cafeteria/updatedAt").set(new Date().toISOString());

    return NextResponse.json({
      success: true,
      type,
      waitingCount: updated,
    });
  } catch (err) {
    console.error("[sensor API error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
