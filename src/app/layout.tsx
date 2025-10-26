// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CountrySelect from "@/components/CountrySelect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Massme — Boutique",
  description: "Boutique multi-pays et multi-devises avec Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900`}>
        <div className="mx-auto max-w-6xl p-4">
          <header className="flex items-center justify-between mb-6">
            <a href="/" className="text-xl font-semibold">Massme</a>
            <CountrySelect />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
