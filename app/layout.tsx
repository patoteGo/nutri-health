import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nutri Health",
  description: "Track your meals and nutrition.",
  icons: [
    { rel: "icon", url: "/fruit-icon.svg" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", sizes: "192x192", url: "/android-chrome-192x192.png" },
    { rel: "icon", type: "image/png", sizes: "512x512", url: "/android-chrome-512x512.png" },
    { rel: "icon", type: "image/x-icon", sizes: "32x32 16x16", url: "/favicon.ico" },
    { rel: "mask-icon", url: "/fruit-icon.svg" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reason: Wraps app with LanguageProvider for i18n support and injects Header with multilingual menu for all pages
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
