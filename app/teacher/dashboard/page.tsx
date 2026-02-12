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
import {
  Cog,
  FileUp,
  ClipboardList,
  BarChart3,
  Download,
  LogOut,
} from "lucide-react";

export default async function TeacherDashboard() {
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
            <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
              教員
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
          <h1 className="text-2xl font-bold">教員ダッシュボード</h1>
          <p className="text-[var(--muted-foreground)]">
            教材管理、テスト生成、成績管理を行います
          </p>
        </div>

        {/* 機能カード */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 教科書登録 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileUp className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">教科書登録</CardTitle>
              <CardDescription>
                PDFをアップロードして教材を登録
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                <FileUp className="mr-2 h-4 w-4" />
                PDFをアップロード
              </Button>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                ※ 教材管理機能は次のフェーズで実装予定
              </p>
            </CardContent>
          </Card>

          {/* テスト自動生成 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">テスト自動生成</CardTitle>
              <CardDescription>
                AIが単元から問題を自動生成
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                <ClipboardList className="mr-2 h-4 w-4" />
                テストを作成
              </Button>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                ※ Gemini APIによる生成機能は次のフェーズで実装予定
              </p>
            </CardContent>
          </Card>

          {/* 成績管理 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">成績管理</CardTitle>
              <CardDescription>
                生徒の成績一覧と分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                <BarChart3 className="mr-2 h-4 w-4" />
                成績を確認
              </Button>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                ※ 成績管理機能は次のフェーズで実装予定
              </p>
            </CardContent>
          </Card>

          {/* モノグサ連携 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Download className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">モノグサ連携</CardTitle>
              <CardDescription>
                重要語句をCSVでエクスポート
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                CSVダウンロード
              </Button>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                ※ CSV出力機能は次のフェーズで実装予定
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
