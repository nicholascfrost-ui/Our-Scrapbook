import { readFileSync } from "node:fs";
import path from "node:path";
import type { Store } from "./types";
// Personalized seed files stay local and out of Git. Hosted data comes from
// the authenticated database; a fresh deployment never publishes seed records.
function initialStore(): Store {
  try {
    return JSON.parse(
      readFileSync(path.join(process.cwd(), "data/initial-store.json"), "utf8"),
    );
  } catch {
    return {
      version: 1,
      wedding: "2026-10-10T16:30:00-05:00",
      letter: "",
      items: [],
      visits: [],
      belts: ["White", "Blue", "Purple", "Brown", "Black"].map((name, i) => ({
        name,
        earned: i === 0,
      })),
    };
  }
}
export const seed = initialStore();
