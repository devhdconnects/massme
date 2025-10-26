import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const res = NextResponse.next();

  // Cookie country par défaut
  if (!req.cookies.get("country")?.value) {
    res.cookies.set("country", "FR", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  // Garde Admin
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isLogin = url.pathname === "/admin/login";
  const isAuthed = req.cookies.get("admin")?.value === "1";

  if (isAdminRoute && !isLogin && !isAuthed) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return res;
}
