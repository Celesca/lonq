import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LONG | Thailand Match",
  description: "Swipe, save, and plan Thailand travel routes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
