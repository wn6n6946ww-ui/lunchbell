import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8시간

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "fallback-dev-secret";
}

function signToken(id: string, timestamp: number): string {
  return createHmac("sha256", getSecret())
    .update(`${id}:${timestamp}`)
    .digest("hex");
}

export function createSessionToken(id: string): string {
  const ts = Date.now();
  const sig = signToken(id, ts);
  return Buffer.from(JSON.stringify({ id, ts, sig })).toString("base64url");
}

export function verifySessionToken(token: string): boolean {
  try {
    const { id, ts, sig } = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    ) as { id: string; ts: number; sig: string };

    // 만료 확인
    if (Date.now() - ts > SESSION_MAX_AGE * 1000) return false;

    const expected = signToken(id, ts);
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyCredentials(id: string, password: string): boolean {
  const adminId = process.env.ADMIN_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminId || !adminPassword) return false;

  try {
    const idOk = timingSafeEqual(Buffer.from(id), Buffer.from(adminId));
    const pwOk = timingSafeEqual(
      Buffer.from(password),
      Buffer.from(adminPassword)
    );
    return idOk && pwOk;
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE;
