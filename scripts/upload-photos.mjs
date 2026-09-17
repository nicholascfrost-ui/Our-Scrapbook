import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
// Run locally only. Read credentials from environment; never commit them.
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
  throw Error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY locally for this one-time migration. Never set the service key in a NEXT_PUBLIC variable.",
  );
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
for (const name of await fs.readdir("private/photos")) {
  if (!name.endsWith(".jpg")) continue;
  const { error } = await client.storage
    .from("photos")
    .upload(name, await fs.readFile("private/photos/" + name), {
      contentType: "image/jpeg",
      upsert: false,
    });
  if (error && !error.message.includes("already exists")) throw error;
  console.log("Prepared", name);
}
