import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  title: "Our Lists · Nicholas & Mae Frost",
  description: "A scrapbook for our Adventures.",
  robots: { index: false, follow: false },
  applicationName: "Our Lists",
  appleWebApp: { capable: true, title: "Our Lists", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = { themeColor: "#263c2a" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
