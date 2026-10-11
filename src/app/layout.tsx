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
  title: "Kids Quest",
  description:
    "Learn math, writing, and chess — earn energy, explore the map, collect coins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
