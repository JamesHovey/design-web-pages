import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design Web Pages - AI-Powered Website Design Generator",
  description: "Create distinctive, production-grade website designs with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
