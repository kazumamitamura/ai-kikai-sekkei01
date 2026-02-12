import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ側（クライアントコンポーネント）で使う Supabase クライアント。
 * シングルトンとして返されるため、何度呼んでも同じインスタンス。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
