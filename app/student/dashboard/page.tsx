import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cog, PenLine, BarChart3, BookOpen, LogOut } from "lucide-react";

export default async function StudentDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("sk01_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ナビゲーション */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Cog className="h-6 w-6 text-[var(--primary)]" />
            <span className="text-lg font-bold">機械設計Ⅰ</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              生徒
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted-foreground)]">
              {profile?.full_name ?? user.email}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            ようこそ、{profile?.full_name ?? "生徒"}さん
          </h1>
          <p className="text-[var(--muted-foreground)]">
            テストの受験と成績の確認ができます
          </p>
        </div>

        {/* 機能カード */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* CBT受験 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <PenLine className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">テスト受験</CardTitle>
              <CardDescription>
                配信されたテストをWEB上で解答
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                <PenLine className="mr-2 h-4 w-4" />
                テスト一覧を見る
              </Button>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                ※ 現在配信中のテストはありません
              </p>
            </CardContent>
          </Card>

          {/* 成績確認 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">成績確認</CardTitle>
              <CardDescription>
                過去のテスト結果とスコア履歴
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                <BarChart3 className="mr-2 h-4 w-4" />
                成績を確認
              </Button>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                ※ テスト受験後に成績が表示されます
              </p>
            </CardContent>
          </Card>

          {/* 学習教材 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">学習教材</CardTitle>
              <CardDescription>
                教科書や参考資料を閲覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                <BookOpen className="mr-2 h-4 w-4" />
                教材を見る
              </Button>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                ※ 教材が登録されるとここに表示されます
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
