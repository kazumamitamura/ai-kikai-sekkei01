import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase Auth のコールバックハンドラー。
 * メール確認リンクからのリダイレクトを処理する。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // セッション確立後、ロールに基づいてリダイレクト
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("sk01_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "teacher") {
          return NextResponse.redirect(`${origin}/teacher/dashboard`);
        }
        return NextResponse.redirect(`${origin}/student/dashboard`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // エラー時はログインページへ
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
