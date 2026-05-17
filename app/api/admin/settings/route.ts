import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getMealTimeSettings,
  setMealTimeSettings,
  resetMealTimeSettings,
  type MealTimeSettings,
} from "@/lib/adminSettings";

// GET /api/admin/settings — 현재 급식 시간 설정 조회
export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getMealTimeSettings());
}

// POST /api/admin/settings — 급식 시간 설정 변경
export async function POST(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as Partial<MealTimeSettings> & { reset?: boolean };

  if (body.reset) {
    resetMealTimeSettings();
    return NextResponse.json({ success: true, settings: getMealTimeSettings() });
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const fields: (keyof MealTimeSettings)[] = [
    "lunchStart", "lunchEnd", "dinnerStart", "dinnerEnd",
  ];

  for (const field of fields) {
    if (body[field] !== undefined && !timeRegex.test(body[field] as string)) {
      return NextResponse.json(
        { error: `${field} 값이 올바른 시간 형식(HH:MM)이 아닙니다.` },
        { status: 400 }
      );
    }
  }

  const current = getMealTimeSettings();
  setMealTimeSettings({ ...current, ...body });

  return NextResponse.json({ success: true, settings: getMealTimeSettings() });
}
