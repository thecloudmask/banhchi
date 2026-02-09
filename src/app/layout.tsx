import React from "react";
import type { Metadata, Viewport } from "next";
import { Outfit, Kantumruy_Pro, Moul } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/providers/language-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const kantumruy = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kantumruy",
  display: "swap",
});

const moul = Moul({
  subsets: ["khmer"],
  weight: ["400"],
  variable: "--font-moul",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Banhchi - Digital Event Companion",
  description: "Modern event contribution tracking for Khmer weddings and ceremonies.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#eab308",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${kantumruy.variable} ${moul.variable} antialiased font-sans bg-background text-foreground`}
      >
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster position="top-center" richColors />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
