import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware 用 Supabase クライアント。
 * セッショントークンの自動リフレッシュを担当する。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションリフレッシュ — getUser() を呼ぶことでトークンが更新される
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- ルート保護ロジック ---

  const pathname = request.nextUrl.pathname;

  // 認証不要のパス
  const publicPaths = ["/login", "/signup", "/auth/callback"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  // 未認証ユーザーが保護ルートにアクセスした場合 → /login へリダイレクト
  if (!user && !isPublicPath && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 認証済みユーザーのロールベースリダイレクト
  if (user) {
    // プロフィールからロールを取得（他アプリで登録したユーザーは sk01_profiles にいない）
    const { data: profile } = await supabase
      .from("sk01_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;
    const hasSk01Profile = role === "teacher" || role === "student";

    // このアプリのユーザーではない（sk01_profiles にいない）→ ログインへ（ループ防止）
    if (!hasSk01Profile && (pathname.startsWith("/teacher") || pathname.startsWith("/student"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("message", "このアプリには新規登録が必要です。");
      return NextResponse.redirect(url);
    }

    // ログイン・サインアップページにアクセスした場合 → ダッシュボードへ
    if (isPublicPath) {
      const url = request.nextUrl.clone();
      if (role === "teacher") {
        url.pathname = "/teacher/dashboard";
      } else {
        url.pathname = "/student/dashboard";
      }
      return NextResponse.redirect(url);
    }

    // 教員ルートに生徒がアクセスした場合
    if (pathname.startsWith("/teacher") && role !== "teacher") {
      const url = request.nextUrl.clone();
      url.pathname = "/student/dashboard";
      return NextResponse.redirect(url);
    }

    // 生徒ルートに教員がアクセスした場合
    if (pathname.startsWith("/student") && role !== "student") {
      const url = request.nextUrl.clone();
      url.pathname = "/teacher/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
