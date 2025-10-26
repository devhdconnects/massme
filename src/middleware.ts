import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const country = req.cookies.get("country")?.value;

  if (!country) {
    // défaut: FR
    res.cookies.set("country", "FR", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}
