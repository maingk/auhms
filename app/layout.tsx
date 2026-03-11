import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUHMS — Averett University Housing Management System",
  description: "Housing management system for Averett University",
  robots: {
    index: false,  // Internal system — do not index
    follow: false,
  },
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
