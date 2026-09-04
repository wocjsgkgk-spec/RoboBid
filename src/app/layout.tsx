import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { Toaster } from "@/components/ui/sonner-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoboBid AI — BidOps Intelligence Platform",
  description:
    "로봇·특수목적 하드웨어 공공 공모사업 End-to-End BidOps Intelligence Platform",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
          <PwaInstallPrompt />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
