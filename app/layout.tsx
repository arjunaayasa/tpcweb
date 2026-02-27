import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taxindo Prime Consulting | AI-Powered Tax Solutions",
  description: "Professional tax consulting enhanced by TPC AI. Chat with Owlie and explore tax laws.",
  openGraph: {
    title: "Taxindo Prime Consulting | AI-Powered Tax Solutions",
    description: "Professional tax consulting enhanced by TPC AI. Chat with Owlie and explore tax laws.",
    url: "https://taxindoprime.com",
    siteName: "Taxindo Prime Consulting",
    images: [
      {
        url: "/logoowliechat.png",
        width: 800,
        height: 800,
        alt: "Taxindo Prime Consulting Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taxindo Prime Consulting | AI-Powered Tax Solutions",
    description: "Professional tax consulting enhanced by TPC AI. Chat with Owlie and explore tax laws.",
    images: ["/logoowliechat.png"],
  },
  icons: {
    icon: "/logoowliechat.png",
    shortcut: "/logoowliechat.png",
    apple: "/logoowliechat.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}
