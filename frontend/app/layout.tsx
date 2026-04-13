import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PakVote — Pakistan's Digital Voting Platform",
  description: "A secure, transparent, and accessible digital voting platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}