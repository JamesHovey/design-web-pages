import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import VersionIndicator from "@/components/VersionIndicator";

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
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
        <VersionIndicator />
      </body>
    </html>
  );
}
