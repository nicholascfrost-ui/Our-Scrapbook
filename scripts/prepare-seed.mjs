import fs from "node:fs";
const r = await fetch("http://127.0.0.1:3000/api/store");
if (!r.ok) throw Error("Start the local preview before preparing the seed.");
const { store } = await r.json();
const json = JSON.stringify(store);
if (json.includes("$scrapbook$"))
  throw Error("Unexpected SQL delimiter in data.");
fs.writeFileSync(
  "supabase/seed.sql",
  `insert into public.scrapbook(id,data,revision) values ('ours',$scrapbook$${json}$scrapbook$::jsonb,1) on conflict(id) do nothing;\n`,
);
console.log("Prepared database seed from local scrapbook.");
