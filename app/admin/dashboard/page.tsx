"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogOut, RotateCcw, Save, ArrowLeft, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Settings {
  lunchStart: string;
  lunchEnd: string;
  dinnerStart: string;
  dinnerEnd: string;
}

const SCHOOL_NAME = process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "수완고등학교";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    lunchStart: "",
    lunchEnd: "",
    dinnerStart: "",
    dinnerEnd: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    if (res.status === 401) {
      router.replace("/admin");
      return;
    }
    const data = await res.json() as Settings;
    setSettings(data);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    const data = await res.json() as { error?: string; settings?: Settings };
    if (!res.ok) {
      setError(data.error ?? "저장 실패");
    } else {
      if (data.settings) setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleReset() {
    if (!confirm("기본값으로 초기화하시겠습니까?")) return;
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    });
    const data = await res.json() as { settings?: Settings };
    if (data.settings) {
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  }

  function TimeInput({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              메인
            </a>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold">관리자 설정</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition hover:bg-muted"
            >
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold">급식 시간 설정</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {SCHOOL_NAME} — 변경 즉시 학생 화면에 반영됩니다.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* 점심 */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">🍜</span>
                <span className="font-semibold">점심 급식</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TimeInput
                  label="시작 시간"
                  value={settings.lunchStart}
                  onChange={(v) => setSettings((s) => ({ ...s, lunchStart: v }))}
                />
                <TimeInput
                  label="종료 시간"
                  value={settings.lunchEnd}
                  onChange={(v) => setSettings((s) => ({ ...s, lunchEnd: v }))}
                />
              </div>
            </div>

            {/* 저녁 */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">🍚</span>
                <span className="font-semibold">저녁 급식</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TimeInput
                  label="시작 시간"
                  value={settings.dinnerStart}
                  onChange={(v) => setSettings((s) => ({ ...s, dinnerStart: v }))}
                />
                <TimeInput
                  label="종료 시간"
                  value={settings.dinnerEnd}
                  onChange={(v) => setSettings((s) => ({ ...s, dinnerEnd: v }))}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {saved && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                저장되었습니다.
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "저장 중..." : "저장하기"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
                기본값
              </button>
            </div>
          </form>
        )}

        {/* 계정 정보 안내 */}
        <div className="mt-8 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">초기 관리자 계정</p>
          <p className="mt-1">아이디: <code className="font-mono">swhs_admin</code></p>
          <p>비밀번호: <code className="font-mono">SuWan2026!</code></p>
          <p className="mt-2 text-yellow-600 dark:text-yellow-400">
            ⚠ 배포 후 반드시 .env의 ADMIN_ID / ADMIN_PASSWORD를 변경하세요.
          </p>
        </div>
      </main>
    </div>
  );
}
