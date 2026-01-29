import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import VisitTracker from "@/components/visit-tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taxindo Prime Consulting | AI-Powered Tax Solutions",
  description: "Professional tax consulting enhanced by TPC AI. Chat with Owlie and explore tax laws.",
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
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}
