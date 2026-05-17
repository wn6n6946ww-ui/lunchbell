"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "로그인 실패");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("서버 연결 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Lock className="h-7 w-7" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">관리자 로그인</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "수완고등학교"} 급식줄알리미
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">아이디</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="관리자 아이디"
                autoComplete="username"
                required
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-ring focus:ring-2"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-10 text-sm outline-none ring-ring focus:ring-2"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          교사 전용 페이지입니다. 학생은{" "}
          <a href="/" className="underline underline-offset-2 hover:text-foreground">
            메인 화면
          </a>
          으로 이동하세요.
        </p>
      </div>
    </div>
  );
}
