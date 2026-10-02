import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "AqlTest",
  description: "AqlTest — mantiqiy fikrlash testi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js?63"
          strategy="beforeInteractive"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}