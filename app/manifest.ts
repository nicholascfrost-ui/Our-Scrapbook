import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Our Lists — Nicholas & Mae",
    short_name: "Our Lists",
    description: "A scrapbook for our Adventures.",
    start_url: "/#home",
    display: "standalone",
    background_color: "#f7f4e9",
    theme_color: "#263c2a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
