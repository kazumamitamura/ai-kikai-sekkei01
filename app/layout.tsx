import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "機械設計Ⅰ | 学習支援プラットフォーム",
  description:
    "AIを活用した機械設計Ⅰの学習支援・評価プラットフォーム。教科書PDFから自動でテストを生成し、CBT形式で受験・即時採点が可能です。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
