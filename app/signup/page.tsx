"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cog, GraduationCap, BookOpen, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Role = "teacher" | "student";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // ⚠️ 最重要: app_context を必ず含める（データ隔離ルール）
            app_context: "sk01",
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) {
        // 既に登録済み → ログイン案内（他アプリ含め同一プロジェクトで1メール1アカウントのため）
        const isAlreadyRegistered =
          signUpError.message.toLowerCase().includes("already registered") ||
          signUpError.message.toLowerCase().includes("already exists") ||
          signUpError.code === "user_already_exists";
        setError(
          isAlreadyRegistered
            ? "このメールアドレスは既に登録されています。ログインしてください。"
            : signUpError.message
        );
        return;
      }

      // 登録成功 → ロールに応じてリダイレクト
      if (role === "teacher") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch {
      setError("予期しないエラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
            <Cog className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <CardTitle>新規アカウント登録</CardTitle>
          <CardDescription>
            機械設計Ⅰ 学習支援プラットフォーム
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {/* エラー表示 */}
            {error && (
              <div className="rounded-md bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">
                <p>{error}</p>
                {error.includes("既に登録されています") && (
                  <Link
                    href="/login"
                    className="mt-2 inline-block font-medium text-[var(--primary)] underline hover:no-underline"
                  >
                    ログインページへ →
                  </Link>
                )}
              </div>
            )}

            {/* ロール選択 */}
            <div className="space-y-2">
              <Label>ロール（役割）を選択</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors cursor-pointer ${
                    role === "teacher"
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <GraduationCap
                    className={`h-8 w-8 ${
                      role === "teacher"
                        ? "text-[var(--primary)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      role === "teacher"
                        ? "text-[var(--primary)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    教員
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors cursor-pointer ${
                    role === "student"
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <BookOpen
                    className={`h-8 w-8 ${
                      role === "student"
                        ? "text-[var(--primary)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      role === "student"
                        ? "text-[var(--primary)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    生徒
                  </span>
                </button>
              </div>
            </div>

            {/* 名前 */}
            <div className="space-y-2">
              <Label htmlFor="fullName">氏名</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="山田 太郎"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* メール */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@school.ac.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : (
                "アカウントを作成"
              )}
            </Button>
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              すでにアカウントをお持ちですか？{" "}
              <Link
                href="/login"
                className="font-medium text-[var(--primary)] hover:underline"
              >
                ログイン
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
