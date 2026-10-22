import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";

import "./globals.css";

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Learn and Play",
  description: "Year 2 practice, stars, and a short memory game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
