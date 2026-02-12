"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Cog, Loader2 } from "lucide-react";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) setInfoMessage(decodeURIComponent(message));
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // ログイン成功 → プロフィールからロールを取得してリダイレクト
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("ユーザー情報の取得に失敗しました。");
        return;
      }

      const { data: profile } = await supabase
        .from("sk01_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // このアプリ用プロフィールがない（他アプリのみ登録）→ ループ防止
      if (!profile?.role || (profile.role !== "teacher" && profile.role !== "student")) {
        setError(
          "このアカウントは機械設計Ⅰアプリに登録されていません。同じメールで新規登録はできません。このアプリ用に登録したアカウントでログインしてください。"
        );
        return;
      }

      if (profile.role === "teacher") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }

      router.refresh();
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
          <CardTitle>ログイン</CardTitle>
          <CardDescription>
            機械設計Ⅰ 学習支援プラットフォーム
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {/* リダイレクト時の案内（例: このアプリには新規登録が必要です） */}
            {infoMessage && (
              <div className="rounded-md bg-[var(--primary)]/10 p-3 text-sm text-[var(--primary)]">
                {infoMessage}
              </div>
            )}

            {/* エラー表示 */}
            {error && (
              <div className="rounded-md bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">
                {error}
              </div>
            )}

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
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ログイン中...
                </>
              ) : (
                "ログイン"
              )}
            </Button>
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              アカウントをお持ちでないですか？{" "}
              <Link
                href="/signup"
                className="font-medium text-[var(--primary)] hover:underline"
              >
                新規登録
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
