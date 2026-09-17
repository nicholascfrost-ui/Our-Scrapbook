import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Our Lists · Nicholas & Mae Frost",
  description: "A scrapbook for our Adventures.",
  robots: { index: false, follow: false },
};
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
