import { seed } from "./seed";
import { Store } from "./types";
import { promises as fs } from "node:fs";
import path from "node:path";
const file = path.join(process.cwd(), "data/local-store.json");
export async function readLocal(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    return structuredClone(seed);
  }
}
let queue: Promise<unknown> = Promise.resolve();
export function mutateLocal(fn: (s: Store) => Store) {
  const task = queue.then(async () => {
    const s = fn(await readLocal());
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file + ".tmp", JSON.stringify(s, null, 2));
    await fs.rename(file + ".tmp", file);
    return s;
  });
  queue = task.catch(() => {});
  return task;
}
