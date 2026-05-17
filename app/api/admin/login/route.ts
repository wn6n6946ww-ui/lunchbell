import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const body = await request.json() as { id?: string; password?: string };
  const { id, password } = body;

  if (!id || !password) {
    return NextResponse.json({ error: "아이디와 비밀번호를 입력하세요." }, { status: 400 });
  }

  if (!verifyCredentials(id, password)) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = createSessionToken(id);
  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}
