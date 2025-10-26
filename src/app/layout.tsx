// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import CountrySelect from "@/components/CountrySelect";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Massme — Boutique",
  description: "Boutique multi-pays et multi-devises avec Next.js",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await cookies(); // Next 16 : cookies() renvoie une Promise
  const cart = JSON.parse(c.get("cart")?.value ?? "[]") as Array<{ qty?: number }>;
  const count = cart.reduce((n, it) => n + (it.qty ?? 0), 0);
  const currentCountry = (c.get("country")?.value || "FR") as "FR" | "US" | "GB";

  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900`}>
        <div className="mx-auto max-w-6xl p-4">
          <header className="flex items-center justify-between mb-6">
            <Link href="/" className="text-xl font-semibold">
              Massme
            </Link>
            <nav className="flex items-center gap-4">
              {/* Sélecteur de pays */}
              <CountrySelect current={currentCountry} />

              {/* Lien Admin (discret) */}
              <Link href="/admin" className="underline text-sm">
                Admin
              </Link>

              {/* Panier avec badge quantité */}
              <Link href="/cart" className="relative inline-flex items-center underline">
                Panier
                {count > 0 && (
                  <span
                    aria-label={`${count} article(s) dans le panier`}
                    className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-xs"
                  >
                    {count}
                  </span>
                )}
              </Link>
            </nav>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
