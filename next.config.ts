import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  outputFileTracingExcludes: {
    "/*": [
      "./private/**/*",
      "./Photos/**/*",
      "./work/**/*",
      "./data/initial-store.json",
      "./data/local-store.json",
      "./data/inspirations.json",
      "./supabase/seed.sql",
    ],
  },
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};
export default config;
