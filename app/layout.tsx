import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { formatDate } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anavrin Sarees",
  description: "Garment Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="fixed bottom-0 right-0 p-1 bg-background/80 text-[10px] text-muted-foreground pointer-events-none z-50">
          v0.1.4 (Updated: {formatDate(new Date())} {new Date().toLocaleTimeString()})
        </footer>
      </body>
    </html>
  );
}
