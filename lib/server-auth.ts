import { createClient } from "@supabase/supabase-js";
export function cloudConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}
export async function authorize(req: Request) {
  if (!cloudConfigured()) {
    if (process.env.VERCEL || process.env.REQUIRE_AUTH === "true")
      return {
        error: "Private access is not configured yet.",
        status: 503,
      } as const;
    const host = new URL(req.url).hostname;
    if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host))
      return { error: "Local preview only.", status: 403 } as const;
    return { local: true } as const;
  }
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return { error: "Please sign in.", status: 401 } as const;
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    },
  );
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user)
    return { error: "Please sign in again.", status: 401 } as const;
  const { data: member, error: memberError } = await client
    .from("members")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (memberError || !member)
    return {
      error: "This scrapbook is for Nicholas and Mae.",
      status: 403,
    } as const;
  return { client, user: data.user } as const;
}
