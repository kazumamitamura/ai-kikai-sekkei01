import Link from "next/link";
import { BookOpen, GraduationCap, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Cog className="h-6 w-6 text-[var(--primary)]" />
            <span className="text-lg font-bold">機械設計Ⅰ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                ログイン
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">新規登録</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-[var(--primary)]/10 p-4">
              <Cog className="h-12 w-12 text-[var(--primary)]" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            機械設計Ⅰ
            <br />
            <span className="text-[var(--primary)]">学習支援プラットフォーム</span>
          </h1>
          <p className="mb-8 text-lg text-[var(--muted-foreground)]">
            AIが教科書から自動でテストを生成。
            <br />
            CBT形式で受験し、即時に採点・解説を確認できます。
          </p>

          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                無料で始める
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                ログイン
              </Button>
            </Link>
          </div>

          {/* 特徴カード */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] p-6 text-left">
              <GraduationCap className="mb-3 h-8 w-8 text-[var(--primary)]" />
              <h3 className="mb-2 font-semibold">教員向け</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                教科書PDFをアップロードするだけで、AIが単元ごとのテストを自動生成。評価基準に沿った問題が数秒で完成します。
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-6 text-left">
              <BookOpen className="mb-3 h-8 w-8 text-[var(--primary)]" />
              <h3 className="mb-2 font-semibold">生徒向け</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                配信されたテストをWEBブラウザで受験。即座に正誤判定と解説が表示され、効率的に学習を進められます。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted-foreground)]">
        <p>&copy; 2026 機械設計Ⅰ 学習支援プラットフォーム</p>
      </footer>
    </div>
  );
}
