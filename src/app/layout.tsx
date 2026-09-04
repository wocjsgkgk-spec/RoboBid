import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoboBid AI — BidOps Intelligence Platform",
  description:
    "로봇·특수목적 하드웨어 공공 공모사업 End-to-End BidOps Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider defaultTheme="light" storageKey="robobid-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
