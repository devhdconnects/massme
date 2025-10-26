"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPPORTED = ["FR", "US", "GB"] as const;
type Supported = typeof SUPPORTED[number];

export async function setCountryAction(formData: FormData) {
  const code = String(formData.get("country") || "FR").toUpperCase() as Supported;
  const to = String(formData.get("redirectTo") || "/");

  const c = await cookies(); // Next 16: cookies() est async
  c.set("country", SUPPORTED.includes(code) ? code : "FR", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(to);
}
