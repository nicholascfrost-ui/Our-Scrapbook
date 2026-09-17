import { NextResponse } from "next/server";
import { authorize, cloudConfigured } from "@/lib/server-auth";
import { readLocal, mutateLocal } from "@/lib/store";
import type { Store, Item, Visit } from "@/lib/types";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const auth = await authorize(req);
  if ("error" in auth)
    return NextResponse.json(
      { error: auth.error, cloud: cloudConfigured() },
      { status: auth.status },
    );
  if ("local" in auth)
    return NextResponse.json({ store: await readLocal(), mode: "local" });
  const { data, error } = await auth.client
    .from("scrapbook")
    .select("data")
    .eq("id", "ours")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json(
      { error: "The private scrapbook is not initialized yet." },
      { status: 503 },
    );
  return NextResponse.json({ store: data.data, mode: "shared" });
}
function mutate(s: Store, b: Record<string, unknown>): Store {
  if (b.action === "item") {
    const item = b.item as Item;
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      !item.title.trim()
    )
      throw Error("Give this idea a title.");
    if (item.url && !/^https?:\/\//i.test(item.url))
      throw Error("Use a full http or https link.");
    item.updatedAt = new Date().toISOString();
    s.items = [item, ...s.items.filter((i) => i.id !== item.id)];
  } else if (b.action === "visit") {
    const v = b.visit as Visit;
    if (!v?.id || !v.name) throw Error("Choose a place.");
    s.visits = [v, ...s.visits.filter((x) => x.id !== v.id)];
  } else if (b.action === "belts") {
    s.belts = b.belts as Store["belts"];
  } else if (b.action === "letter") {
    s.letter = String(b.letter || "");
  } else throw Error("Unknown change.");
  s.version = (s.version || 0) + 1;
  return s;
}
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (
    origin &&
    new URL(origin).host !== (req.headers.get("host") || new URL(req.url).host)
  )
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const auth = await authorize(req);
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const b = await req.json();
    if ("local" in auth)
      return NextResponse.json({
        store: await mutateLocal((s) => mutate(s, b)),
      });
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await auth.client
        .from("scrapbook")
        .select("data,revision")
        .eq("id", "ours")
        .single();
      if (error) throw Error("Run the database setup before saving.");
      const store = mutate(structuredClone(data.data), b);
      const { data: updated, error: writeError } = await auth.client
        .from("scrapbook")
        .update({ data: store, revision: data.revision + 1 })
        .eq("id", "ours")
        .eq("revision", data.revision)
        .select("id");
      if (writeError) throw writeError;
      if (updated?.length) return NextResponse.json({ store });
    }
    return NextResponse.json(
      { error: "Another change was just saved. Refresh and try again." },
      { status: 409 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save." },
      { status: 400 },
    );
  }
}
